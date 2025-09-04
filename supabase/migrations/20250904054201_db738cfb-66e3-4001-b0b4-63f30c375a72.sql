-- Enhanced Trainer Verification System Database Structure
-- Phase 1: Create modular tables to avoid GOD table anti-pattern

-- Create enums for verification system
CREATE TYPE verification_check_type AS ENUM (
  'cimspa_membership',
  'insurance_proof', 
  'first_aid_certification',
  'qualifications',
  'identity_match'
);

CREATE TYPE verification_check_status AS ENUM (
  'pending',
  'verified', 
  'rejected',
  'expired'
);

CREATE TYPE verification_display_preference AS ENUM (
  'verified_allowed',
  'hidden'
);

CREATE TYPE verification_overall_status AS ENUM (
  'verified',
  'not_shown', 
  'expired'
);

CREATE TYPE verification_audit_action AS ENUM (
  'upload',
  'verify',
  'reject', 
  'delete',
  'toggle_preference',
  'expire'
);

CREATE TYPE verification_audit_actor AS ENUM (
  'admin',
  'trainer',
  'system'
);

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trainer-verification-documents', 'trainer-verification-documents', false);

-- Storage policies for verification documents bucket
CREATE POLICY "Trainers can upload their own verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'trainer-verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Trainers can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'trainer-verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Trainers can update their own verification documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'trainer-verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Trainers can delete their own verification documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'trainer-verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'trainer-verification-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- 1. Trainer Verification Overview Table (Master Status & Preferences)
CREATE TABLE public.trainer_verification_overview (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_preference verification_display_preference NOT NULL DEFAULT 'verified_allowed',
  overall_status verification_overall_status NOT NULL DEFAULT 'not_shown',
  last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one record per trainer
  UNIQUE(trainer_id)
);

-- Enable RLS on trainer verification overview
ALTER TABLE public.trainer_verification_overview ENABLE ROW LEVEL SECURITY;

-- RLS policies for trainer verification overview
CREATE POLICY "Trainers can view their own verification overview" 
ON public.trainer_verification_overview 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = trainer_verification_overview.trainer_id 
    AND profiles.id = auth.uid()
    AND profiles.user_type = 'trainer'
  )
);

CREATE POLICY "Trainers can update their own verification overview" 
ON public.trainer_verification_overview 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = trainer_verification_overview.trainer_id 
    AND profiles.id = auth.uid()
    AND profiles.user_type = 'trainer'
  )
);

CREATE POLICY "Trainers can insert their own verification overview" 
ON public.trainer_verification_overview 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = trainer_verification_overview.trainer_id 
    AND profiles.id = auth.uid()
    AND profiles.user_type = 'trainer'
  )
);

CREATE POLICY "Admins can manage all verification overviews" 
ON public.trainer_verification_overview 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Individual Verification Checks Table
CREATE TABLE public.trainer_verification_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_type verification_check_type NOT NULL,
  status verification_check_status NOT NULL DEFAULT 'pending',
  
  -- Verification metadata (flexible for different check types)
  provider TEXT, -- Insurance provider, First aid provider, etc.
  awarding_body TEXT, -- For qualifications
  member_id TEXT, -- CIMSPA member ID
  certificate_id TEXT, -- Certificate numbers
  policy_number TEXT, -- Insurance policy number
  level INTEGER, -- Qualification level
  coverage_amount DECIMAL, -- Insurance coverage amount
  
  -- Dates
  issue_date DATE,
  expiry_date DATE,
  
  -- Evidence
  evidence_file_url TEXT, -- Storage path to uploaded document
  evidence_metadata JSONB DEFAULT '{}', -- Additional file info
  
  -- Admin review
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one active check per type per trainer
  UNIQUE(trainer_id, check_type)
);

-- Enable RLS on verification checks
ALTER TABLE public.trainer_verification_checks ENABLE ROW LEVEL SECURITY;

-- RLS policies for verification checks
CREATE POLICY "Trainers can view their own verification checks" 
ON public.trainer_verification_checks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = trainer_verification_checks.trainer_id 
    AND profiles.id = auth.uid()
    AND profiles.user_type = 'trainer'
  )
);

CREATE POLICY "Trainers can manage their own verification checks" 
ON public.trainer_verification_checks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = trainer_verification_checks.trainer_id 
    AND profiles.id = auth.uid()
    AND profiles.user_type = 'trainer'
  )
);

CREATE POLICY "Admins can manage all verification checks" 
ON public.trainer_verification_checks 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Verification Audit Log Table
CREATE TABLE public.trainer_verification_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_id UUID REFERENCES public.trainer_verification_checks(id) ON DELETE CASCADE,
  actor verification_audit_actor NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  action verification_audit_action NOT NULL,
  
  -- Action details
  previous_status verification_check_status,
  new_status verification_check_status,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.trainer_verification_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit log
CREATE POLICY "Trainers can view their own verification audit log" 
ON public.trainer_verification_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = trainer_verification_audit_log.trainer_id 
    AND profiles.id = auth.uid()
    AND profiles.user_type = 'trainer'
  )
);

CREATE POLICY "Admins can view all verification audit logs" 
ON public.trainer_verification_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit log entries" 
ON public.trainer_verification_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 4. Enhance existing trainer_verification_requests table with new fields
ALTER TABLE public.trainer_verification_requests 
ADD COLUMN IF NOT EXISTS evidence_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS submission_notes TEXT,
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS provider_name TEXT,
ADD COLUMN IF NOT EXISTS certificate_number TEXT;

-- Create function to compute overall verification status
CREATE OR REPLACE FUNCTION public.compute_trainer_verification_status(p_trainer_id UUID)
RETURNS verification_overall_status
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  overview_record trainer_verification_overview;
  required_checks verification_check_type[] := ARRAY['cimspa_membership', 'insurance_proof', 'first_aid_certification'];
  check_type verification_check_type;
  check_status verification_check_status;
  has_expired_check BOOLEAN := false;
  all_verified BOOLEAN := true;
BEGIN
  -- Get the trainer's verification overview
  SELECT * INTO overview_record 
  FROM trainer_verification_overview 
  WHERE trainer_id = p_trainer_id;
  
  -- If no overview record or preference is hidden, return not_shown
  IF NOT FOUND OR overview_record.display_preference = 'hidden' THEN
    RETURN 'not_shown';
  END IF;
  
  -- Check each required verification type
  FOREACH check_type IN ARRAY required_checks LOOP
    SELECT status INTO check_status 
    FROM trainer_verification_checks 
    WHERE trainer_id = p_trainer_id AND check_type = check_type;
    
    -- If check doesn't exist or isn't verified
    IF NOT FOUND OR check_status != 'verified' THEN
      all_verified := false;
    END IF;
    
    -- If any check is expired
    IF check_status = 'expired' THEN
      has_expired_check := true;
    END IF;
  END LOOP;
  
  -- Determine overall status
  IF has_expired_check THEN
    RETURN 'expired';
  ELSIF all_verified THEN
    RETURN 'verified';
  ELSE
    RETURN 'not_shown';
  END IF;
END;
$$;

-- Create function to update overall verification status
CREATE OR REPLACE FUNCTION public.update_trainer_verification_status(p_trainer_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_status verification_overall_status;
BEGIN
  -- Compute the new status
  new_status := public.compute_trainer_verification_status(p_trainer_id);
  
  -- Update the overview table
  INSERT INTO trainer_verification_overview (trainer_id, overall_status, last_computed_at)
  VALUES (p_trainer_id, new_status, now())
  ON CONFLICT (trainer_id) 
  DO UPDATE SET 
    overall_status = new_status,
    last_computed_at = now(),
    updated_at = now();
END;
$$;

-- Create trigger to auto-update verification status when checks change
CREATE OR REPLACE FUNCTION public.trigger_update_verification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.update_trainer_verification_status(COALESCE(NEW.trainer_id, OLD.trainer_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply trigger to verification checks table
CREATE TRIGGER update_verification_status_on_check_change
  AFTER INSERT OR UPDATE OR DELETE ON public.trainer_verification_checks
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_verification_status();

-- Apply trigger to verification overview table  
CREATE TRIGGER update_verification_status_on_preference_change
  AFTER UPDATE ON public.trainer_verification_overview
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_verification_status();

-- Create function to check for expiring documents and update status
CREATE OR REPLACE FUNCTION public.check_verification_expiry()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update expired checks
  UPDATE trainer_verification_checks 
  SET 
    status = 'expired',
    updated_at = now()
  WHERE expiry_date < CURRENT_DATE 
    AND status = 'verified';
    
  -- Log expiry actions
  INSERT INTO trainer_verification_audit_log (
    trainer_id, check_id, actor, action, previous_status, new_status, reason
  )
  SELECT 
    trainer_id, id, 'system', 'expire', 'verified', 'expired', 
    'Document expired on ' || expiry_date::text
  FROM trainer_verification_checks 
  WHERE expiry_date < CURRENT_DATE AND status = 'expired';
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_trainer_verification_checks_trainer_status 
ON public.trainer_verification_checks(trainer_id, status);

CREATE INDEX idx_trainer_verification_checks_expiry 
ON public.trainer_verification_checks(expiry_date) 
WHERE expiry_date IS NOT NULL;

CREATE INDEX idx_trainer_verification_audit_trainer 
ON public.trainer_verification_audit_log(trainer_id, created_at DESC);

-- Create updated_at triggers for the new tables
CREATE TRIGGER update_trainer_verification_overview_updated_at
  BEFORE UPDATE ON public.trainer_verification_overview
  FOR EACH ROW EXECUTE FUNCTION public.update_alerts_updated_at();

CREATE TRIGGER update_trainer_verification_checks_updated_at
  BEFORE UPDATE ON public.trainer_verification_checks
  FOR EACH ROW EXECUTE FUNCTION public.update_alerts_updated_at();