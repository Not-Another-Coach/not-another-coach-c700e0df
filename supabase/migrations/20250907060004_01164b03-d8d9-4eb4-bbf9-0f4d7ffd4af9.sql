-- Update admin_update_verification_check to create trainer notifications
CREATE OR REPLACE FUNCTION public.admin_update_verification_check(
  p_check_id UUID,
  p_status verification_check_status,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  check_record RECORD;
  trainer_name TEXT;
BEGIN
  -- Only admins can update verification checks
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification checks';
  END IF;

  -- Get the check details
  SELECT * INTO check_record
  FROM trainer_verification_checks
  WHERE id = p_check_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification check not found';
  END IF;

  -- Update the check
  UPDATE trainer_verification_checks
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    verified_at = CASE WHEN p_status = 'verified' THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = p_check_id;

  -- Get trainer name
  SELECT COALESCE(first_name || ' ' || last_name, email) INTO trainer_name
  FROM profiles WHERE id = check_record.trainer_id;

  -- Create trainer notification
  INSERT INTO alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'verification_check_update',
    CASE 
      WHEN p_status = 'verified' THEN 'Document Verified!'
      WHEN p_status = 'rejected' THEN 'Document Verification Issue'
      ELSE 'Document Under Review'
    END,
    CASE 
      WHEN p_status = 'verified' THEN 'Your ' || check_record.check_type || ' document has been verified.'
      WHEN p_status = 'rejected' THEN 'Your ' || check_record.check_type || ' document needs attention. ' || COALESCE('Reason: ' || p_rejection_reason, 'Please review the feedback.')
      ELSE 'Your ' || check_record.check_type || ' document is under review.'
    END,
    jsonb_build_object('trainers', jsonb_build_array(check_record.trainer_id)),
    jsonb_build_object(
      'trainer_id', check_record.trainer_id,
      'check_id', p_check_id,
      'check_type', check_record.check_type,
      'status', p_status,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    true
  );

  -- Create audit log entry
  INSERT INTO trainer_verification_audit_log (
    trainer_id, check_id, actor, action, previous_status, new_status, reason
  )
  VALUES (
    check_record.trainer_id, p_check_id, auth.uid(), 
    'admin_update', check_record.status, p_status,
    COALESCE(p_admin_notes, 'Admin update: ' || p_status)
  );

  -- Update trainer's overall verification status
  PERFORM update_trainer_verification_status(check_record.trainer_id);
END;
$$;

-- Update check_verification_expiry to create trainer notifications for expiring certificates
CREATE OR REPLACE FUNCTION public.check_verification_expiry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  expiring_check RECORD;
  expired_check RECORD;
BEGIN
  -- Create notifications for certificates expiring within 14 days
  FOR expiring_check IN 
    SELECT tvc.*, p.first_name, p.last_name, p.email
    FROM trainer_verification_checks tvc
    JOIN profiles p ON tvc.trainer_id = p.id
    WHERE tvc.expiry_date BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 14
      AND tvc.status = 'verified'
      AND NOT EXISTS (
        SELECT 1 FROM alerts 
        WHERE alert_type = 'verification_expiry_warning'
          AND metadata->>'check_id' = tvc.id::text
          AND created_at > CURRENT_DATE - INTERVAL '7 days'
      )
  LOOP
    INSERT INTO alerts (
      alert_type,
      title,
      content,
      target_audience,
      metadata,
      is_active
    )
    VALUES (
      'verification_expiry_warning',
      'Document Expiring Soon',
      'Your ' || expiring_check.check_type || ' expires on ' || expiring_check.expiry_date::text || '. Please update it soon.',
      jsonb_build_object('trainers', jsonb_build_array(expiring_check.trainer_id)),
      jsonb_build_object(
        'trainer_id', expiring_check.trainer_id,
        'check_id', expiring_check.id,
        'check_type', expiring_check.check_type,
        'expiry_date', expiring_check.expiry_date,
        'days_until_expiry', expiring_check.expiry_date - CURRENT_DATE
      ),
      true
    );
  END LOOP;

  -- Update expired checks and create notifications
  FOR expired_check IN 
    SELECT tvc.*, p.first_name, p.last_name, p.email
    FROM trainer_verification_checks tvc
    JOIN profiles p ON tvc.trainer_id = p.id
    WHERE tvc.expiry_date < CURRENT_DATE 
      AND tvc.status = 'verified'
  LOOP
    -- Update status to expired
    UPDATE trainer_verification_checks 
    SET 
      status = 'expired',
      updated_at = now()
    WHERE id = expired_check.id;
    
    -- Create expiry notification for trainer
    INSERT INTO alerts (
      alert_type,
      title,
      content,
      target_audience,
      metadata,
      is_active
    )
    VALUES (
      'verification_expired',
      'Document Expired',
      'Your ' || expired_check.check_type || ' has expired. Please upload a new document to maintain your verification status.',
      jsonb_build_object('trainers', jsonb_build_array(expired_check.trainer_id)),
      jsonb_build_object(
        'trainer_id', expired_check.trainer_id,
        'check_id', expired_check.id,
        'check_type', expired_check.check_type,
        'expired_on', expired_check.expiry_date
      ),
      true
    );
    
    -- Log expiry action
    INSERT INTO trainer_verification_audit_log (
      trainer_id, check_id, actor, action, previous_status, new_status, reason
    )
    VALUES (
      expired_check.trainer_id, expired_check.id, 'system', 'expire', 
      'verified', 'expired', 'Document expired on ' || expired_check.expiry_date::text
    );
  END LOOP;

  -- Update overall verification status for affected trainers
  PERFORM update_trainer_verification_status(trainer_id)
  FROM (
    SELECT DISTINCT trainer_id 
    FROM trainer_verification_checks 
    WHERE expiry_date <= CURRENT_DATE + 14 AND status IN ('verified', 'expired')
  ) AS affected_trainers;
END;
$$;