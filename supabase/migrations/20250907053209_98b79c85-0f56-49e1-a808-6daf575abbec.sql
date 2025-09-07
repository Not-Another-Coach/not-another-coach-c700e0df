-- Create or update admin_update_verification_check function with audit logging
CREATE OR REPLACE FUNCTION public.admin_update_verification_check(
  p_check_id uuid,
  p_status verification_check_status,
  p_admin_notes text DEFAULT NULL,
  p_rejection_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  check_record RECORD;
  previous_status verification_check_status;
BEGIN
  -- Only admins can update verification checks
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification checks';
  END IF;

  -- Get current check data for audit logging
  SELECT * INTO check_record
  FROM trainer_verification_checks
  WHERE id = p_check_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification check not found';
  END IF;
  
  -- Store previous status for audit
  previous_status := check_record.status;
  
  -- Update the verification check
  UPDATE trainer_verification_checks
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    verified_at = CASE WHEN p_status = 'verified' THEN now() ELSE NULL END,
    verified_by = CASE WHEN p_status = 'verified' THEN auth.uid() ELSE NULL END,
    updated_at = now()
  WHERE id = p_check_id;
  
  -- Create audit log entry
  INSERT INTO trainer_verification_audit_log (
    trainer_id,
    check_id,
    actor,
    action,
    previous_status,
    new_status,
    reason,
    metadata
  ) VALUES (
    check_record.trainer_id,
    p_check_id,
    'admin',
    CASE 
      WHEN p_status = 'verified' THEN 'verify'
      WHEN p_status = 'rejected' THEN 'reject'
      ELSE 'update'
    END,
    previous_status,
    p_status,
    COALESCE(p_rejection_reason, p_admin_notes, 'Admin status update'),
    jsonb_build_object(
      'admin_id', auth.uid(),
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason,
      'previous_data', jsonb_build_object(
        'status', previous_status,
        'admin_notes', check_record.admin_notes,
        'rejection_reason', check_record.rejection_reason
      ),
      'timestamp', now()
    )
  );

  -- Update overall verification status
  PERFORM update_trainer_verification_status(check_record.trainer_id);
END;
$$;