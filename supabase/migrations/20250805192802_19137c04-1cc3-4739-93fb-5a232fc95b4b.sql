-- Create a function to update user email addresses for admin purposes
CREATE OR REPLACE FUNCTION public.update_user_email_for_admin(target_user_id uuid, new_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only admins can update emails
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update user emails';
  END IF;

  -- Update email in auth.users table
  UPDATE auth.users 
  SET email = new_email, 
      updated_at = now()
  WHERE id = target_user_id;

  -- Log the admin action
  PERFORM public.log_admin_action(
    target_user_id,
    'update_email',
    jsonb_build_object('new_email', new_email),
    'Email updated by admin'
  );

  RETURN true;
END;
$function$;