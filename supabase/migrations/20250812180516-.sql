-- Phase 3: Advanced Features Database Schema (Fixed)

-- Create storage bucket for onboarding attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'onboarding-attachments', 
  'onboarding-attachments', 
  false,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- Storage policies for onboarding attachments
CREATE POLICY "Trainers can upload their onboarding attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'onboarding-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Trainers can view their onboarding attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'onboarding-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Trainers can update their onboarding attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'onboarding-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Trainers can delete their onboarding attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'onboarding-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Clients can view attachments for their assigned activities
CREATE POLICY "Clients can view assigned onboarding attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'onboarding-attachments' AND
  EXISTS (
    SELECT 1 FROM client_onboarding_progress cop
    WHERE cop.client_id = auth.uid()
    AND cop.attachments::text LIKE '%' || (storage.objects.name) || '%'
  )
);

-- Create activity assignments table for linking activities to template sections
CREATE TABLE IF NOT EXISTS onboarding_activity_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN ('getting_started', 'ongoing_support', 'commitments', 'trainer_notes')),
  section_item_id UUID NOT NULL, -- References the specific section item (getting_started.id, etc.)
  activity_id UUID NOT NULL,
  assignment_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  custom_instructions TEXT,
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for activity assignments
ALTER TABLE onboarding_activity_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage their activity assignments"
ON onboarding_activity_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM trainer_onboarding_templates t
    WHERE t.id = onboarding_activity_assignments.template_id
    AND t.trainer_id = auth.uid()
  )
);

-- Add publishing workflow columns to templates
ALTER TABLE trainer_onboarding_templates 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS published_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lock_reason TEXT,
ADD COLUMN IF NOT EXISTS last_structural_change_at TIMESTAMP WITH TIME ZONE;

-- Add visibility matrix columns to all section tables
ALTER TABLE onboarding_getting_started
ADD COLUMN IF NOT EXISTS visibility_client BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS visibility_trainer BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_in_summary BOOLEAN DEFAULT true;

ALTER TABLE onboarding_ongoing_support
ADD COLUMN IF NOT EXISTS visibility_client BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS visibility_trainer BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_in_summary BOOLEAN DEFAULT true;

ALTER TABLE onboarding_commitments
ADD COLUMN IF NOT EXISTS visibility_client BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS visibility_trainer BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_in_summary BOOLEAN DEFAULT true;

ALTER TABLE onboarding_trainer_notes
ADD COLUMN IF NOT EXISTS visibility_client BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS visibility_trainer BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_in_summary BOOLEAN DEFAULT false;

-- Enhanced attachment system for getting started tasks
ALTER TABLE onboarding_getting_started
ADD COLUMN IF NOT EXISTS allowed_file_types JSONB DEFAULT '["image", "document", "link"]'::jsonb,
ADD COLUMN IF NOT EXISTS max_file_size_per_attachment_mb INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS attachment_upload_instructions TEXT;

-- Add SLA and due date enhancements
ALTER TABLE onboarding_getting_started
ADD COLUMN IF NOT EXISTS auto_calculate_due_date BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS due_date_business_days_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sla_escalation_hours INTEGER,
ADD COLUMN IF NOT EXISTS sla_reminder_hours INTEGER DEFAULT 24;

-- Create template publishing audit log
CREATE TABLE IF NOT EXISTS onboarding_template_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('published', 'unpublished', 'locked', 'unlocked', 'version_created', 'structural_change')),
  action_by UUID NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  action_reason TEXT,
  version_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for audit log
ALTER TABLE onboarding_template_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view their template audit logs"
ON onboarding_template_audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM trainer_onboarding_templates t
    WHERE t.id = onboarding_template_audit_log.template_id
    AND t.trainer_id = auth.uid()
  )
);

CREATE POLICY "System can create audit log entries"
ON onboarding_template_audit_log FOR INSERT
WITH CHECK (true);

-- Create function to calculate due dates with business days (fixed variable name)
CREATE OR REPLACE FUNCTION calculate_business_due_date(
  start_date TIMESTAMP WITH TIME ZONE,
  business_days INTEGER
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  calc_date TIMESTAMP WITH TIME ZONE := start_date;
  days_added INTEGER := 0;
  day_of_week INTEGER;
BEGIN
  WHILE days_added < business_days LOOP
    calc_date := calc_date + INTERVAL '1 day';
    day_of_week := EXTRACT(DOW FROM calc_date);
    
    -- Skip weekends (0 = Sunday, 6 = Saturday)
    IF day_of_week NOT IN (0, 6) THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;
  
  RETURN calc_date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to lock template after publishing
CREATE OR REPLACE FUNCTION lock_template_on_publish()
RETURNS TRIGGER AS $$
BEGIN
  -- If template is being published for the first time
  IF NEW.published_at IS NOT NULL AND OLD.published_at IS NULL THEN
    NEW.is_locked := true;
    NEW.lock_reason := 'Template locked after publishing to prevent structural changes';
    
    -- Create audit log entry
    INSERT INTO onboarding_template_audit_log (
      template_id, action_type, action_by, action_details, version_number
    ) VALUES (
      NEW.id, 'published', auth.uid(), 
      jsonb_build_object('locked', true, 'first_publish', true),
      NEW.published_version
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for template locking
DROP TRIGGER IF EXISTS trigger_lock_template_on_publish ON trainer_onboarding_templates;
CREATE TRIGGER trigger_lock_template_on_publish
  BEFORE UPDATE ON trainer_onboarding_templates
  FOR EACH ROW
  EXECUTE FUNCTION lock_template_on_publish();

-- Update the set_onboarding_due_dates function to handle business days
CREATE OR REPLACE FUNCTION set_onboarding_due_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Compute due_at from due_days with business day calculation
  IF (NEW.due_at IS NULL) AND (NEW.due_days IS NOT NULL) THEN
    IF NEW.due_date_business_days_only = true THEN
      NEW.due_at := calculate_business_due_date(now(), NEW.due_days);
    ELSE
      NEW.due_at := now() + make_interval(days => NEW.due_days);
    END IF;
  END IF;

  -- Compute sla_due_at from sla_hours if not set
  IF (NEW.sla_due_at IS NULL) AND (NEW.sla_hours IS NOT NULL) THEN
    NEW.sla_due_at := now() + make_interval(hours => NEW.sla_hours);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_assignments_template_section 
ON onboarding_activity_assignments(template_id, section_type, section_item_id);

CREATE INDEX IF NOT EXISTS idx_activity_assignments_activity 
ON onboarding_activity_assignments(activity_id);

CREATE INDEX IF NOT EXISTS idx_template_audit_log_template 
ON onboarding_template_audit_log(template_id, created_at DESC);

-- Add updated_at trigger to activity assignments
CREATE TRIGGER update_activity_assignments_updated_at
  BEFORE UPDATE ON onboarding_activity_assignments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();