-- Fix the admin_update_verification_check function - remove email column reference
-- and improve audit logging and notifications

CREATE OR REPLACE FUNCTION public.admin_update_verification_check(
  p_check_id uuid,
  p_status verification_check_status,
  p_admin_notes text DEFAULT NULL,
  p_rejection_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  check_record RECORD;
  trainer_record RECORD;
  admin_name text;
  notification_title text;
  notification_content text;
  check_type_label text;
  previous_status verification_check_status;
BEGIN
  -- Check admin permissions
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification checks';
  END IF;

  -- Get the verification check details
  SELECT * INTO check_record
  FROM trainer_verification_checks
  WHERE id = p_check_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification check not found';
  END IF;

  -- Get trainer details from profiles (not auth.users since email column doesn't exist in profiles)
  SELECT p.id, p.first_name, p.last_name, p.user_type
  INTO trainer_record
  FROM profiles p
  WHERE p.id = check_record.trainer_id;

  -- Get admin name
  SELECT COALESCE(first_name || ' ' || last_name, 'Admin') INTO admin_name
  FROM profiles
  WHERE id = auth.uid();

  -- Store previous status for audit
  previous_status := check_record.status;

  -- Update the verification check
  UPDATE trainer_verification_checks
  SET 
    status = p_status,
    verified_by = CASE WHEN p_status = 'verified' THEN auth.uid() ELSE verified_by END,
    verified_at = CASE WHEN p_status = 'verified' THEN now() ELSE verified_at END,
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    admin_notes = p_admin_notes,
    updated_at = now()
  WHERE id = p_check_id;

  -- Prepare notification details
  check_type_label := CASE check_record.check_type
    WHEN 'cimspa_membership' THEN 'CIMSPA Membership'
    WHEN 'insurance_proof' THEN 'Professional Insurance'
    WHEN 'first_aid_certification' THEN 'First Aid Certification'
    ELSE initcap(replace(check_record.check_type::text, '_', ' '))
  END;

  -- Create notifications based on status
  IF p_status = 'verified' THEN
    notification_title := check_type_label || ' Verified';
    notification_content := 'Your ' || check_type_label || ' has been verified and approved by ' || admin_name || '.';
  ELSIF p_status = 'rejected' THEN
    notification_title := check_type_label || ' Rejected';
    notification_content := 'Your ' || check_type_label || ' submission was rejected by ' || admin_name || 
      CASE WHEN p_rejection_reason IS NOT NULL 
        THEN '. Reason: ' || p_rejection_reason 
        ELSE '. Please review and resubmit.'
      END;
  ELSE
    notification_title := check_type_label || ' Under Review';
    notification_content := 'Your ' || check_type_label || ' submission is now under review by ' || admin_name || '.';
  END IF;

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
    notification_title,
    notification_content,
    jsonb_build_object('trainers', jsonb_build_array(check_record.trainer_id)),
    jsonb_build_object(
      'trainer_id', check_record.trainer_id,
      'check_id', p_check_id,
      'check_type', check_record.check_type,
      'new_status', p_status,
      'previous_status', previous_status,
      'admin_id', auth.uid(),
      'admin_name', admin_name,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason,
      'reviewed_at', now()
    ),
    true
  );

  -- Create admin notification for pending requests count update
  INSERT INTO alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'verification_admin_action',
    'Verification Review Completed',
    admin_name || ' ' || 
    CASE p_status
      WHEN 'verified' THEN 'approved'
      WHEN 'rejected' THEN 'rejected'
      ELSE 'reviewed'
    END || ' ' || check_type_label || ' for ' || 
    COALESCE(trainer_record.first_name || ' ' || trainer_record.last_name, 'trainer'),
    jsonb_build_object('admins', jsonb_build_array('all')),
    jsonb_build_object(
      'trainer_id', check_record.trainer_id,
      'check_id', p_check_id,
      'check_type', check_record.check_type,
      'action', p_status,
      'admin_id', auth.uid(),
      'admin_name', admin_name,
      'processed_at', now()
    ),
    true
  );

  -- Enhanced audit log entry with detailed information
  INSERT INTO trainer_verification_audit_log (
    trainer_id,
    check_id,
    actor,
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
    CASE p_status
      WHEN 'verified' THEN 'approve'
      WHEN 'rejected' THEN 'reject'
      ELSE 'review'
    END,
    previous_status,
    p_status,
    COALESCE(p_rejection_reason, p_admin_notes, 'Status updated by admin'),
    jsonb_build_object(
      'admin_id', auth.uid(),
      'admin_name', admin_name,
      'check_type', check_record.check_type,
      'check_type_label', check_type_label,
      'trainer_name', COALESCE(trainer_record.first_name || ' ' || trainer_record.last_name, 'Unknown'),
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason,
      'provider', check_record.provider,
      'certificate_id', check_record.certificate_id,
      'member_id', check_record.member_id,
      'policy_number', check_record.policy_number,
      'expiry_date', check_record.expiry_date,
      'has_evidence_file', CASE WHEN check_record.evidence_file_url IS NOT NULL THEN true ELSE false END,
      'processing_time_days', EXTRACT(EPOCH FROM (now() - check_record.created_at)) / 86400,
      'reviewed_at', now()
    )
  );

  -- Log admin action
  PERFORM log_admin_action(
    check_record.trainer_id,
    'verification_check_' || p_status::text,
    jsonb_build_object(
      'check_id', p_check_id,
      'check_type', check_record.check_type,
      'previous_status', previous_status,
      'new_status', p_status,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason,
      'trainer_name', COALESCE(trainer_record.first_name || ' ' || trainer_record.last_name, 'Unknown')
    ),
    'Verification check status updated from ' || previous_status::text || ' to ' || p_status::text
  );

  -- Update overall trainer verification status
  PERFORM update_trainer_verification_status(check_record.trainer_id);
END;
$$;