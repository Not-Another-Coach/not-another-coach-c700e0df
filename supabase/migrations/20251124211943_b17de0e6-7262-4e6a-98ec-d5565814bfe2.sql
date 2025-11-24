-- Step 1: Create trigger function to auto-set date_profile_completed
CREATE OR REPLACE FUNCTION set_profile_completed_date()
RETURNS TRIGGER AS $$
BEGIN
  -- When profile_setup_completed changes from false/null to true, set date_profile_completed
  IF NEW.profile_setup_completed = true 
     AND (OLD.profile_setup_completed IS NULL OR OLD.profile_setup_completed = false)
     AND NEW.date_profile_completed IS NULL THEN
    NEW.date_profile_completed = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically set date_profile_completed
DROP TRIGGER IF EXISTS trigger_set_profile_completed_date ON profiles;
CREATE TRIGGER trigger_set_profile_completed_date
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_profile_completed_date();

-- Step 2: Update can_user_access_platform function with tighter access control
CREATE OR REPLACE FUNCTION can_user_access_platform(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  trainer_access_enabled BOOLEAN;
  client_access_enabled BOOLEAN;
BEGIN
  -- Get user information
  SELECT * INTO user_record
  FROM profiles
  WHERE id = user_id;

  -- If user not found, deny access
  IF user_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Admins always have access
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = user_id 
    AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Get access settings from app_settings
  SELECT (setting_value::jsonb->>'enabled')::boolean INTO trainer_access_enabled
  FROM app_settings
  WHERE setting_key = 'trainer_access_enabled';

  SELECT (setting_value::jsonb->>'enabled')::boolean INTO client_access_enabled
  FROM app_settings
  WHERE setting_key = 'client_access_enabled';

  -- Default to true if settings don't exist
  trainer_access_enabled := COALESCE(trainer_access_enabled, TRUE);
  client_access_enabled := COALESCE(client_access_enabled, TRUE);

  -- Handle trainers
  IF user_record.user_type = 'trainer' THEN
    -- Grandfathering: Allow access if date_profile_completed is NULL (existing users before this change)
    IF user_record.date_profile_completed IS NULL THEN
      RETURN TRUE;
    END IF;
    
    -- For trainers with completed profiles, check the trainer_access_enabled setting
    IF user_record.profile_setup_completed = TRUE THEN
      RETURN trainer_access_enabled;
    END IF;
    
    -- Incomplete profiles: Allow access to complete their setup
    RETURN TRUE;
  END IF;

  -- Handle clients
  IF user_record.user_type = 'client' THEN
    -- Grandfathering: Allow access if date_profile_completed is NULL
    IF user_record.date_profile_completed IS NULL THEN
      RETURN TRUE;
    END IF;
    
    -- For clients with completed profiles, check the client_access_enabled setting
    IF user_record.profile_setup_completed = TRUE THEN
      RETURN client_access_enabled;
    END IF;
    
    -- Incomplete profiles: Allow access to complete their setup
    RETURN TRUE;
  END IF;

  -- Default: deny access
  RETURN FALSE;
END;
$$;