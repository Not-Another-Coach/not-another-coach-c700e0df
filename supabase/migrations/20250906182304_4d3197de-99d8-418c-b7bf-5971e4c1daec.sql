-- Fix the admin_update_verification_check function to properly handle audit logs and notifications
CREATE OR REPLACE FUNCTION public.admin_update_verification_check(
  p_trainer_id uuid, 
  p_check_type verification_check_type, 
  p_status verification_check_status, 
  p_admin_notes text DEFAULT NULL, 
  p_rejection_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  check_id UUID;
  previous_status verification_check_status;
  trainer_name TEXT;
BEGIN
  -- Only admins can update verification checks
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification checks';
  END IF;

  -- Get existing check and its current status
  SELECT id, status INTO check_id, previous_status
  FROM trainer_verification_checks
  WHERE trainer_id = p_trainer_id AND check_type = p_check_type;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification check not found for trainer % and type %', p_trainer_id, p_check_type;
  END IF;

  -- Update the check
  UPDATE trainer_verification_checks
  SET
    status = p_status,
    verified_by = CASE WHEN p_status IN ('verified', 'rejected') THEN auth.uid() ELSE verified_by END,
    verified_at = CASE WHEN p_status IN ('verified', 'rejected') THEN now() ELSE verified_at END,
    admin_notes = p_admin_notes,
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    updated_at = now()
  WHERE id = check_id;

  -- Log the admin action in audit trail
  INSERT INTO trainer_verification_audit_log (
    trainer_id, check_id, actor, actor_id, action, 
    previous_status, new_status, reason, metadata
  )
  VALUES (
    p_trainer_id, check_id, 'admin', auth.uid(),
    CASE 
      WHEN p_status = 'verified' THEN 'verify'
      WHEN p_status = 'rejected' THEN 'reject'
      ELSE 'update'
    END,
    previous_status, p_status, 
    COALESCE(p_rejection_reason, p_admin_notes, 'Status updated by admin'),
    jsonb_build_object(
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    )
  );

  -- Get trainer name for notification
  SELECT COALESCE(first_name || ' ' || last_name, email) INTO trainer_name
  FROM profiles WHERE id = p_trainer_id;

  -- Create notification for trainer when rejected or verified
  IF p_status IN ('verified', 'rejected') THEN
    INSERT INTO alerts (
      alert_type,
      title,
      content,
      target_audience,
      metadata,
      is_active
    )
    VALUES (
      CASE WHEN p_status = 'verified' THEN 'verification_approved' ELSE 'verification_rejected' END,
      CASE 
        WHEN p_status = 'verified' THEN 'Verification Approved'
        ELSE 'Verification Rejected'
      END,
      CASE 
        WHEN p_status = 'verified' THEN 'Your ' || p_check_type || ' verification has been approved!'
        ELSE 'Your ' || p_check_type || ' verification was rejected. ' || 
             CASE WHEN p_rejection_reason IS NOT NULL THEN 'Reason: ' || p_rejection_reason ELSE 'Please review the feedback and resubmit.' END
      END,
      jsonb_build_object('trainers', jsonb_build_array(p_trainer_id)),
      jsonb_build_object(
        'trainer_id', p_trainer_id,
        'check_type', p_check_type,
        'status', p_status,
        'admin_notes', p_admin_notes,
        'rejection_reason', p_rejection_reason
      ),
      true
    );
  END IF;

  -- Log admin action
  PERFORM public.log_admin_action(
    p_trainer_id,
    'verification_check_update',
    jsonb_build_object(
      'check_type', p_check_type,
      'previous_status', previous_status,
      'new_status', p_status,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    'Individual verification check updated'
  );

  -- Update overall trainer verification status
  PERFORM public.update_trainer_verification_status(p_trainer_id);

  RETURN check_id;
END;
$$;

-- Create function to log admin actions if it doesn't exist
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_target_user_id uuid,
  p_action_type text,
  p_action_details jsonb,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO admin_actions_log (
    admin_id, target_user_id, action_type, action_details, reason
  )
  VALUES (
    auth.uid(), p_target_user_id, p_action_type, p_action_details, p_reason
  );
END;
$$;