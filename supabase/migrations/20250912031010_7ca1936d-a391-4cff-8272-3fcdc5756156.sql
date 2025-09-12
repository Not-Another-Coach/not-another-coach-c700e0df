-- Fix Tab 12 backend error by removing nonexistent profiles.email reference in trigger function
-- The error "column \"email\" does not exist" occurs when inserting into trainer_verification_checks,
-- because the trigger function generate_admin_alert_for_document_submission selected profiles.email.
-- Replace it to only use first_name/last_name with a safe fallback.

CREATE OR REPLACE FUNCTION public.generate_admin_alert_for_document_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  trainer_name TEXT;
  check_type_label TEXT;
BEGIN
  -- Only create alert for new submissions (INSERT)
  IF TG_OP = 'INSERT' THEN
    -- Get trainer name (remove reference to profiles.email which doesn't exist)
    SELECT COALESCE(NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), ''), 'Unknown Trainer')
    INTO trainer_name
    FROM profiles 
    WHERE id = NEW.trainer_id;
    
    -- Get user-friendly check type label
    check_type_label := CASE NEW.check_type
      WHEN 'cimspa_membership' THEN 'CIMSPA Membership'
      WHEN 'insurance_proof' THEN 'Professional Insurance'
      WHEN 'first_aid_certification' THEN 'First Aid Certification'
      WHEN 'qualifications' THEN 'Professional Qualifications'
      WHEN 'identity_match' THEN 'Identity Verification'
      ELSE INITCAP(REPLACE(NEW.check_type, '_', ' '))
    END;
    
    -- Create alert for admins
    INSERT INTO alerts (
      alert_type,
      title,
      content,
      target_audience,
      metadata,
      is_active
    )
    VALUES (
      'document_submission',
      'New Professional Document Submitted',
      COALESCE(trainer_name, 'Unknown Trainer') || ' has submitted ' || check_type_label || ' for review',
      jsonb_build_object('admins', jsonb_build_array('all')),
      jsonb_build_object(
        'trainer_id', NEW.trainer_id,
        'trainer_name', COALESCE(trainer_name, 'Unknown Trainer'),
        'check_id', NEW.id,
        'check_type', NEW.check_type,
        'check_type_label', check_type_label,
        'document_url', NEW.evidence_file_url
      ),
      true
    );
  END IF;
  
  RETURN NEW;
END;
$function$;