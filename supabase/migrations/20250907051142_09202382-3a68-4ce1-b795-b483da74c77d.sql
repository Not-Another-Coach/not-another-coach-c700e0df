-- Simplify the admin_update_verification_check function to remove audit log dependency
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
DECLARE
  current_user_id UUID;
  is_admin_user BOOLEAN := false;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if current user has admin role
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = current_user_id AND role = 'admin'::app_role
  ) INTO is_admin_user;

  -- Only admins can update verification checks
  IF NOT is_admin_user THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification checks. Current user: %, Admin check: %', 
      current_user_id, is_admin_user;
  END IF;

  -- Update the verification check
  UPDATE trainer_verification_checks
  SET 
    status = p_status,
    verified_by = CASE WHEN p_status = 'verified' THEN current_user_id ELSE NULL END,
    verified_at = CASE WHEN p_status = 'verified' THEN now() ELSE NULL END,
    admin_notes = CASE WHEN p_admin_notes != '' THEN p_admin_notes ELSE admin_notes END,
    rejection_reason = CASE WHEN p_status = 'rejected' AND p_rejection_reason != '' THEN p_rejection_reason ELSE NULL END,
    updated_at = now()
  WHERE trainer_id = p_trainer_id AND check_type = p_check_type;

  -- Update trainer verification overview status
  PERFORM update_trainer_verification_status(p_trainer_id);
END;
$$;