-- Fix security issues identified by linter

-- Fix existing functions that may not have proper search_path set
-- Update existing trainer verification function
CREATE OR REPLACE FUNCTION public.update_trainer_verification_status(p_trainer_id uuid, p_status verification_status_enum, p_admin_notes text DEFAULT NULL::text, p_rejection_reason text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only admins can update verification status
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification status';
  END IF;

  -- Update the profile verification status
  UPDATE public.profiles
  SET 
    verification_status = p_status,
    admin_review_notes = p_admin_notes,
    updated_at = now()
  WHERE id = p_trainer_id AND user_type = 'trainer';

  -- Update the verification request
  UPDATE public.trainer_verification_requests
  SET
    status = CASE 
      WHEN p_status = 'verified' THEN 'approved'::verification_request_status
      WHEN p_status = 'rejected' THEN 'rejected'::verification_request_status
      ELSE 'under_review'::verification_request_status
    END,
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    admin_notes = p_admin_notes,
    rejection_reason = p_rejection_reason,
    updated_at = now()
  WHERE trainer_id = p_trainer_id AND status != 'approved' AND status != 'rejected';

  -- Log the admin action
  PERFORM public.log_admin_action(
    p_trainer_id,
    'verification_status_update',
    jsonb_build_object(
      'new_status', p_status,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    'Verification status updated'
  );

  -- Create notification for trainer
  INSERT INTO public.alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'verification_update',
    CASE 
      WHEN p_status = 'verified' THEN 'Profile Verified!'
      WHEN p_status = 'rejected' THEN 'Verification Rejected'
      ELSE 'Verification Under Review'
    END,
    CASE 
      WHEN p_status = 'verified' THEN 'Congratulations! Your trainer profile has been verified and is now published.'
      WHEN p_status = 'rejected' THEN COALESCE('Your verification was rejected. Reason: ' || p_rejection_reason, 'Your verification was rejected. Please review the feedback and resubmit.')
      ELSE 'Your verification request is currently under review by our admin team.'
    END,
    jsonb_build_object('trainers', jsonb_build_array(p_trainer_id)),
    jsonb_build_object(
      'trainer_id', p_trainer_id,
      'verification_status', p_status,
      'admin_notes', p_admin_notes
    ),
    true
  );
END;
$function$;

-- Add enhanced admin function for managing individual verification checks
CREATE OR REPLACE FUNCTION public.admin_update_verification_check(
  p_trainer_id UUID,
  p_check_type verification_check_type,
  p_status verification_check_status,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  check_id UUID;
  previous_status verification_check_status;
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
      ELSE 'upload'
    END,
    previous_status, p_status, 
    COALESCE(p_rejection_reason, p_admin_notes, 'Status updated by admin'),
    jsonb_build_object(
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    )
  );

  -- Log admin action in main log
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

  RETURN check_id;
END;
$$;