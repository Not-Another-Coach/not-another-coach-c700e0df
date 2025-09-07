-- Fix the admin_update_verification_check function to use valid alert types
-- The current function is using 'verification_check_update' which violates the alert_type_check constraint

CREATE OR REPLACE FUNCTION public.admin_update_verification_check(
  p_check_id uuid,
  p_status verification_check_status,
  p_admin_notes text DEFAULT NULL,
  p_rejection_reason text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  check_record trainer_verification_checks;
  trainer_name text;
  admin_name text;
  check_type_display text;
  alert_type_to_use text;
  alert_title text;
  alert_content text;
BEGIN
  -- Only admins can update verification checks
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification checks';
  END IF;

  -- Get the check record
  SELECT * INTO check_record
  FROM trainer_verification_checks
  WHERE id = p_check_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification check not found';
  END IF;

  -- Get trainer and admin names
  SELECT COALESCE(first_name || ' ' || last_name, email, 'Trainer') INTO trainer_name
  FROM profiles 
  WHERE id = check_record.trainer_id;
  
  SELECT COALESCE(first_name || ' ' || last_name, email, 'Admin') INTO admin_name
  FROM profiles 
  WHERE id = auth.uid();

  -- Format check type for display
  check_type_display := CASE check_record.check_type
    WHEN 'first_aid_certification' THEN 'First Aid Certification'
    WHEN 'cimspa_membership' THEN 'CIMSPA Membership'
    WHEN 'insurance_proof' THEN 'Insurance Proof'
    ELSE initcap(replace(check_record.check_type::text, '_', ' '))
  END;

  -- Update the verification check
  UPDATE trainer_verification_checks
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    verified_by = CASE WHEN p_status = 'verified' THEN auth.uid() ELSE verified_by END,
    verified_at = CASE WHEN p_status = 'verified' THEN now() ELSE verified_at END,
    updated_at = now()
  WHERE id = p_check_id;

  -- Set alert details based on status
  IF p_status = 'verified' THEN
    alert_type_to_use := 'verification_approved';
    alert_title := check_type_display || ' Verified';
    alert_content := 'Your ' || check_type_display || ' has been verified and approved by ' || admin_name || '.';
  ELSIF p_status = 'rejected' THEN
    alert_type_to_use := 'verification_rejected';
    alert_title := check_type_display || ' Rejected';
    alert_content := 'Your ' || check_type_display || ' submission was rejected by ' || admin_name || '.' ||
                    CASE WHEN p_rejection_reason IS NOT NULL THEN ' Reason: ' || p_rejection_reason ELSE '' END;
  ELSE
    alert_type_to_use := 'verification_under_review';
    alert_title := check_type_display || ' Under Review';
    alert_content := 'Your ' || check_type_display || ' is being reviewed by ' || admin_name || '.';
  END IF;

  -- Create notification for trainer
  INSERT INTO alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    alert_type_to_use,
    alert_title,
    alert_content,
    jsonb_build_object('trainers', jsonb_build_array(check_record.trainer_id)),
    jsonb_build_object(
      'admin_id', auth.uid(),
      'check_id', p_check_id,
      'check_type', check_record.check_type,
      'trainer_id', check_record.trainer_id,
      'status', p_status,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    true
  );

  -- Create notification for admins
  INSERT INTO alerts (
    alert_type,
    title, 
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'admin_activity',
    'Verification ' || initcap(p_status::text),
    admin_name || ' ' || p_status::text || ' ' || trainer_name || '''s ' || check_type_display,
    jsonb_build_object('admins', jsonb_build_array('all')),
    jsonb_build_object(
      'admin_id', auth.uid(),
      'check_id', p_check_id,
      'check_type', check_record.check_type,
      'trainer_id', check_record.trainer_id,
      'trainer_name', trainer_name,
      'status', p_status,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    true
  );

  -- Log the action in audit log with detailed metadata
  INSERT INTO trainer_verification_audit_log (
    trainer_id,
    check_id,
    actor,
    actor_id,
    action,
    previous_status,
    new_status,
    reason,
    metadata
  )
  VALUES (
    check_record.trainer_id,
    p_check_id,
    'admin',
    auth.uid(),
    CASE 
      WHEN p_status = 'verified' THEN 'approve'
      WHEN p_status = 'rejected' THEN 'reject'
      ELSE 'review'
    END,
    check_record.status,
    p_status,
    COALESCE(p_admin_notes, p_rejection_reason, 'Status updated by admin'),
    jsonb_build_object(
      'admin_name', admin_name,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason,
      'action_timestamp', now()
    )
  );

  -- Update trainer's overall verification status
  PERFORM update_trainer_verification_status(check_record.trainer_id);
END;
$$;