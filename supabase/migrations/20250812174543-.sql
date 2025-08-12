-- Create core onboarding sections tables

-- 1. Getting Started Section (enhanced tasks with rich guidance)
CREATE TABLE IF NOT EXISTS onboarding_getting_started (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES trainer_onboarding_templates(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  description text,
  rich_guidance text, -- Rich text HTML content
  is_mandatory boolean NOT NULL DEFAULT true,
  requires_attachment boolean NOT NULL DEFAULT false,
  attachment_types jsonb DEFAULT '["file", "photo", "link"]'::jsonb,
  max_attachments integer DEFAULT 5,
  max_file_size_mb integer DEFAULT 10,
  due_days integer,
  sla_hours integer, -- Trainer response commitment in hours
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Ongoing Support Section (operational agreements)
CREATE TABLE IF NOT EXISTS onboarding_ongoing_support (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES trainer_onboarding_templates(id) ON DELETE CASCADE,
  check_in_frequency text, -- e.g., "weekly", "biweekly", "monthly"
  check_in_day text, -- e.g., "monday", "friday"
  check_in_time text, -- e.g., "09:00", "14:30"
  check_in_duration integer, -- minutes
  progress_tracking_frequency text, -- e.g., "weekly", "monthly"
  communication_channels jsonb DEFAULT '["email", "app", "whatsapp"]'::jsonb,
  preferred_communication_channel text,
  trainer_response_time_hours integer NOT NULL DEFAULT 24,
  client_response_expectations text,
  emergency_contact_method text,
  session_rescheduling_policy text,
  cancellation_policy text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Commitments & Expectations (dual-sided agreements)
CREATE TABLE IF NOT EXISTS onboarding_commitments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES trainer_onboarding_templates(id) ON DELETE CASCADE,
  commitment_type text NOT NULL CHECK (commitment_type IN ('trainer', 'client', 'mutual')),
  commitment_title text NOT NULL,
  commitment_description text NOT NULL,
  requires_acknowledgment boolean NOT NULL DEFAULT true,
  requires_signature boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Trainer-Specific Section (private notes and setup actions)
CREATE TABLE IF NOT EXISTS onboarding_trainer_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES trainer_onboarding_templates(id) ON DELETE CASCADE,
  note_type text NOT NULL CHECK (note_type IN ('setup_action', 'reminder', 'client_info', 'preparation')),
  title text NOT NULL,
  content text NOT NULL,
  is_checklist_item boolean NOT NULL DEFAULT false,
  due_before_client_start boolean NOT NULL DEFAULT true,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_time_minutes integer,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Client instances for each section (when templates are applied to actual clients)
CREATE TABLE IF NOT EXISTS client_getting_started_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  trainer_id uuid NOT NULL,
  getting_started_id uuid NOT NULL REFERENCES onboarding_getting_started(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  client_notes text,
  trainer_notes text,
  attachments jsonb DEFAULT '[]'::jsonb,
  completed_at timestamp with time zone,
  due_at timestamp with time zone,
  sla_due_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id, getting_started_id)
);

CREATE TABLE IF NOT EXISTS client_ongoing_support_agreements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  trainer_id uuid NOT NULL,
  ongoing_support_id uuid NOT NULL REFERENCES onboarding_ongoing_support(id) ON DELETE CASCADE,
  agreed_check_in_frequency text,
  agreed_check_in_day text,
  agreed_check_in_time text,
  agreed_communication_channel text,
  client_agreed_at timestamp with time zone,
  trainer_agreed_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  custom_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id, ongoing_support_id)
);

CREATE TABLE IF NOT EXISTS client_commitment_acknowledgments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  trainer_id uuid NOT NULL,
  commitment_id uuid NOT NULL REFERENCES onboarding_commitments(id) ON DELETE CASCADE,
  acknowledged_at timestamp with time zone,
  signature_data text, -- Base64 signature image or digital signature hash
  ip_address inet,
  user_agent text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id, commitment_id)
);

CREATE TABLE IF NOT EXISTS trainer_setup_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid NOT NULL,
  client_id uuid NOT NULL,
  trainer_note_id uuid NOT NULL REFERENCES onboarding_trainer_notes(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  notes text,
  time_spent_minutes integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, client_id, trainer_note_id)
);

-- Enable RLS on all tables
ALTER TABLE onboarding_getting_started ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_ongoing_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_trainer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_getting_started_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_ongoing_support_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_commitment_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_setup_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template tables (trainer-only access)
CREATE POLICY "Trainers can manage their getting started templates"
ON onboarding_getting_started
FOR ALL
USING (EXISTS (
  SELECT 1 FROM trainer_onboarding_templates t
  WHERE t.id = onboarding_getting_started.template_id
  AND t.trainer_id = auth.uid()
));

CREATE POLICY "Trainers can manage their ongoing support templates"
ON onboarding_ongoing_support
FOR ALL
USING (EXISTS (
  SELECT 1 FROM trainer_onboarding_templates t
  WHERE t.id = onboarding_ongoing_support.template_id
  AND t.trainer_id = auth.uid()
));

CREATE POLICY "Trainers can manage their commitment templates"
ON onboarding_commitments
FOR ALL
USING (EXISTS (
  SELECT 1 FROM trainer_onboarding_templates t
  WHERE t.id = onboarding_commitments.template_id
  AND t.trainer_id = auth.uid()
));

CREATE POLICY "Trainers can manage their private notes"
ON onboarding_trainer_notes
FOR ALL
USING (EXISTS (
  SELECT 1 FROM trainer_onboarding_templates t
  WHERE t.id = onboarding_trainer_notes.template_id
  AND t.trainer_id = auth.uid()
));

-- RLS Policies for client instance tables
CREATE POLICY "Clients can view their getting started tasks"
ON client_getting_started_progress
FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Trainers can manage their clients' getting started progress"
ON client_getting_started_progress
FOR ALL
USING (auth.uid() = trainer_id);

CREATE POLICY "Clients can update their getting started tasks"
ON client_getting_started_progress
FOR UPDATE
USING (auth.uid() = client_id);

CREATE POLICY "Clients and trainers can view ongoing support agreements"
ON client_ongoing_support_agreements
FOR SELECT
USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Clients and trainers can manage ongoing support agreements"
ON client_ongoing_support_agreements
FOR ALL
USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Clients can view and manage their commitment acknowledgments"
ON client_commitment_acknowledgments
FOR ALL
USING (auth.uid() = client_id);

CREATE POLICY "Trainers can view their clients' commitment acknowledgments"
ON client_commitment_acknowledgments
FOR SELECT
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can manage their setup progress"
ON trainer_setup_progress
FOR ALL
USING (auth.uid() = trainer_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_getting_started_template_id ON onboarding_getting_started(template_id);
CREATE INDEX IF NOT EXISTS idx_ongoing_support_template_id ON onboarding_ongoing_support(template_id);
CREATE INDEX IF NOT EXISTS idx_commitments_template_id ON onboarding_commitments(template_id);
CREATE INDEX IF NOT EXISTS idx_trainer_notes_template_id ON onboarding_trainer_notes(template_id);

CREATE INDEX IF NOT EXISTS idx_client_getting_started_client_id ON client_getting_started_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_client_getting_started_trainer_id ON client_getting_started_progress(trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_ongoing_support_client_id ON client_ongoing_support_agreements(client_id);
CREATE INDEX IF NOT EXISTS idx_client_commitments_client_id ON client_commitment_acknowledgments(client_id);
CREATE INDEX IF NOT EXISTS idx_trainer_setup_trainer_client ON trainer_setup_progress(trainer_id, client_id);

-- Add updated_at triggers
CREATE TRIGGER update_getting_started_updated_at
  BEFORE UPDATE ON onboarding_getting_started
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_ongoing_support_updated_at
  BEFORE UPDATE ON onboarding_ongoing_support
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_commitments_updated_at
  BEFORE UPDATE ON onboarding_commitments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_trainer_notes_updated_at
  BEFORE UPDATE ON onboarding_trainer_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_client_getting_started_updated_at
  BEFORE UPDATE ON client_getting_started_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_client_ongoing_support_updated_at
  BEFORE UPDATE ON client_ongoing_support_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_trainer_setup_updated_at
  BEFORE UPDATE ON trainer_setup_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();