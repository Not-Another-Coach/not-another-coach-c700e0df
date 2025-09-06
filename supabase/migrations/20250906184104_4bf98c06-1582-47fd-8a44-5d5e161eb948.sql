-- Drop any existing admin_update_verification_check functions to resolve overloading issue
DROP FUNCTION IF EXISTS public.admin_update_verification_check(uuid, text, text, text, text);
DROP FUNCTION IF EXISTS public.admin_update_verification_check(uuid, verification_check_type, verification_check_status, text, text);

-- Create the correct admin_update_verification_check function
CREATE OR REPLACE FUNCTION public.admin_update_verification_check(
  p_trainer_id uuid,
  p_check_type verification_check_type,
  p_status verification_check_status,
  p_admin_notes text DEFAULT '',
  p_rejection_reason text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can update verification checks
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification checks';
  END IF;

  -- Update the verification check
  UPDATE trainer_verification_checks
  SET 
    status = p_status,
    verified_by = CASE WHEN p_status = 'verified' THEN auth.uid() ELSE NULL END,
    verified_at = CASE WHEN p_status = 'verified' THEN now() ELSE NULL END,
    admin_notes = CASE WHEN p_admin_notes != '' THEN p_admin_notes ELSE admin_notes END,
    rejection_reason = CASE WHEN p_status = 'rejected' AND p_rejection_reason != '' THEN p_rejection_reason ELSE NULL END,
    updated_at = now()
  WHERE trainer_id = p_trainer_id AND check_type = p_check_type;

  -- Create audit log entry
  INSERT INTO trainer_verification_audit_log (
    trainer_id, check_id, actor, actor_id, action,
    previous_status, new_status, reason, created_at
  )
  SELECT 
    p_trainer_id,
    (SELECT id FROM trainer_verification_checks WHERE trainer_id = p_trainer_id AND check_type = p_check_type),
    'admin'::audit_actor,
    auth.uid(),
    CASE 
      WHEN p_status = 'verified' THEN 'verify'::audit_action
      WHEN p_status = 'rejected' THEN 'reject'::audit_action
      ELSE 'update'::audit_action
    END,
    (SELECT status FROM trainer_verification_checks WHERE trainer_id = p_trainer_id AND check_type = p_check_type),
    p_status::text,
    COALESCE(p_rejection_reason, p_admin_notes, ''),
    now();

  -- Update trainer verification overview status
  PERFORM update_trainer_verification_status(p_trainer_id);
END;
$$;