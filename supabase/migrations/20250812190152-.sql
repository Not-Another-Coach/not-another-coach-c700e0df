-- Phase 5: Advanced Template Features - Complete Schema

-- First create the base onboarding templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS onboarding_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone,
  published_version integer DEFAULT 1,
  is_locked boolean DEFAULT false,
  lock_reason text
);

-- Create onboarding template sections table
CREATE TABLE IF NOT EXISTS onboarding_template_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  section_type text NOT NULL CHECK (section_type IN ('getting_started', 'ongoing_support', 'commitments', 'trainer_notes')),
  step_name text NOT NULL,
  description text,
  instructions text,
  due_days integer,
  due_date_business_days_only boolean DEFAULT false,
  sla_hours integer,
  step_type text DEFAULT 'mandatory' CHECK (step_type IN ('mandatory', 'optional')),
  completion_method text DEFAULT 'client' CHECK (completion_method IN ('client', 'trainer', 'both')),
  requires_file_upload boolean DEFAULT false,
  allowed_attachments jsonb DEFAULT '{"file": true, "link": true, "photo": true, "max_files": 5, "total_max_mb": 30, "max_per_file_mb": 10}',
  visibility text DEFAULT 'shared' CHECK (visibility IN ('shared', 'trainer_only', 'client_only')),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on base tables
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_template_sections ENABLE ROW LEVEL SECURITY;

-- RLS policies for templates
CREATE POLICY "Trainers can manage their own templates"
  ON onboarding_templates FOR ALL
  USING (auth.uid() = trainer_id);

-- RLS policies for template sections
CREATE POLICY "Trainers can manage their template sections"
  ON onboarding_template_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM onboarding_templates ot
      WHERE ot.id = template_id AND ot.trainer_id = auth.uid()
    )
  );

-- Now add conditional logic fields to onboarding templates
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS conditional_logic jsonb DEFAULT '{"rules": [], "dependencies": {}}'::jsonb;
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS package_type_restrictions text[] DEFAULT '{}';
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS version_number integer DEFAULT 1;
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS parent_template_id uuid;
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS is_version boolean DEFAULT false;

-- Create template analytics table
CREATE TABLE IF NOT EXISTS onboarding_template_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('usage', 'completion', 'assignment', 'step_completion')),
  metric_value integer DEFAULT 0,
  metric_data jsonb DEFAULT '{}',
  date_recorded date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(template_id, trainer_id, metric_type, date_recorded)
);

-- Create template versions table
CREATE TABLE IF NOT EXISTS onboarding_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  template_data jsonb NOT NULL,
  changelog text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  is_current boolean DEFAULT false,
  UNIQUE(template_id, version_number)
);

-- Create bulk operations queue table
CREATE TABLE IF NOT EXISTS onboarding_bulk_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL CHECK (operation_type IN ('assign_template', 'update_steps', 'bulk_complete', 'bulk_update')),
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL,
  target_clients uuid[] NOT NULL,
  operation_data jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress_count integer DEFAULT 0,
  total_count integer NOT NULL,
  error_log text[],
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create conditional step evaluations table
CREATE TABLE IF NOT EXISTS onboarding_conditional_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  step_id text NOT NULL,
  condition_result boolean NOT NULL,
  evaluation_data jsonb DEFAULT '{}',
  evaluated_at timestamp with time zone DEFAULT now(),
  UNIQUE(client_id, template_id, step_id)
);

-- Enable RLS on new tables
ALTER TABLE onboarding_template_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_conditional_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS policies for analytics
CREATE POLICY "Trainers can view their own template analytics"
  ON onboarding_template_analytics FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "System can create analytics records"
  ON onboarding_template_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update analytics records"
  ON onboarding_template_analytics FOR UPDATE
  USING (true);

-- RLS policies for versions
CREATE POLICY "Trainers can view their template versions"
  ON onboarding_template_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM onboarding_templates ot
      WHERE ot.id = template_id AND ot.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can create template versions"
  ON onboarding_template_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM onboarding_templates ot
      WHERE ot.id = template_id AND ot.trainer_id = auth.uid()
    )
  );

-- RLS policies for bulk operations
CREATE POLICY "Trainers can manage their bulk operations"
  ON onboarding_bulk_operations FOR ALL
  USING (auth.uid() = trainer_id);

-- RLS policies for conditional evaluations
CREATE POLICY "Clients can view their evaluations"
  ON onboarding_conditional_evaluations FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Trainers can view client evaluations"
  ON onboarding_conditional_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM onboarding_templates ot
      WHERE ot.id = template_id AND ot.trainer_id = auth.uid()
    )
  );

CREATE POLICY "System can manage evaluations"
  ON onboarding_conditional_evaluations FOR ALL
  USING (true);

-- Add updated_at triggers for base tables
CREATE TRIGGER update_onboarding_templates_updated_at
  BEFORE UPDATE ON onboarding_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER update_template_sections_updated_at
  BEFORE UPDATE ON onboarding_template_sections
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();