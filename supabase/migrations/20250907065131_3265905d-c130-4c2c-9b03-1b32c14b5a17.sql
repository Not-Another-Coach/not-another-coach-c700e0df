-- Create function to generate admin alerts when trainers submit professional documents
CREATE OR REPLACE FUNCTION generate_admin_alert_for_document_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  trainer_name TEXT;
  check_type_label TEXT;
BEGIN
  -- Only create alert for new submissions (INSERT)
  IF TG_OP = 'INSERT' THEN
    -- Get trainer name
    SELECT COALESCE(first_name || ' ' || last_name, email, 'Unknown Trainer') 
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
      trainer_name || ' has submitted ' || check_type_label || ' for review',
      jsonb_build_object('admins', jsonb_build_array('all')),
      jsonb_build_object(
        'trainer_id', NEW.trainer_id,
        'trainer_name', trainer_name,
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
$$;

-- Create trigger to generate alerts when trainers submit documents
DROP TRIGGER IF EXISTS trigger_admin_alert_document_submission ON trainer_verification_checks;
CREATE TRIGGER trigger_admin_alert_document_submission
  AFTER INSERT ON trainer_verification_checks
  FOR EACH ROW
  EXECUTE FUNCTION generate_admin_alert_for_document_submission();