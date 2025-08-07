-- Update all user passwords to Password123! for development
-- This function will update all existing user passwords

CREATE OR REPLACE FUNCTION public.update_all_user_passwords_dev()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Only allow admins to run this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can update all user passwords';
  END IF;
  
  -- Loop through all users and update their passwords
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users 
    WHERE email IS NOT NULL
  LOOP
    -- Update each user's password to Password123!
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Password123!', gen_salt('bf')),
      updated_at = now()
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Updated password for user: %', user_record.email;
  END LOOP;
  
  RAISE NOTICE 'All user passwords have been updated to Password123!';
END;
$$;

-- Also create a simpler version that can be run by any authenticated user in development
CREATE OR REPLACE FUNCTION public.update_all_user_passwords_dev_simple()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Allow any authenticated user in development mode
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to update passwords';
  END IF;
  
  -- Loop through all users and update their passwords
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users 
    WHERE email IS NOT NULL
  LOOP
    -- Update each user's password to Password123!
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Password123!', gen_salt('bf')),
      updated_at = now()
    WHERE id = user_record.id;
  END LOOP;
  
  -- Insert a log entry for tracking
  INSERT INTO public.admin_actions_log (admin_id, target_user_id, action_type, action_details, reason)
  SELECT 
    auth.uid(),
    id,
    'password_reset_dev',
    '{"new_password": "Password123!"}',
    'Development password standardization'
  FROM auth.users 
  WHERE email IS NOT NULL;
  
END;
$$;