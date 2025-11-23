-- Add platform access control settings to app_settings
INSERT INTO app_settings (setting_key, setting_value) 
VALUES (
  'platform_access_control',
  '{"trainer_access_enabled": true, "client_access_enabled": true}'::jsonb
)
ON CONFLICT (setting_key) DO NOTHING;

-- Add date_profile_completed to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS date_profile_completed TIMESTAMP WITH TIME ZONE;

-- Create function to check if user can access platform
CREATE OR REPLACE FUNCTION can_user_access_platform(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_type_val text;
  profile_complete boolean;
  profile_completed_date timestamp with time zone;
  access_settings jsonb;
  trainer_enabled boolean;
  client_enabled boolean;
BEGIN
  -- Get user details
  SELECT user_type, profile_setup_completed, date_profile_completed
  INTO user_type_val, profile_complete, profile_completed_date
  FROM profiles 
  WHERE id = user_id;
  
  -- If profile not complete, they can access setup flows
  IF NOT profile_complete THEN
    RETURN true;
  END IF;
  
  -- If profile was completed before this feature was implemented (date is null), grandfather them in
  IF profile_completed_date IS NULL THEN
    RETURN true;
  END IF;
  
  -- Get access settings
  SELECT setting_value INTO access_settings
  FROM app_settings 
  WHERE setting_key = 'platform_access_control';
  
  -- Parse access flags
  trainer_enabled := (access_settings->>'trainer_access_enabled')::boolean;
  client_enabled := (access_settings->>'client_access_enabled')::boolean;
  
  -- Check access based on user type
  IF user_type_val = 'trainer' THEN
    RETURN COALESCE(trainer_enabled, true);
  ELSIF user_type_val = 'client' THEN
    RETURN COALESCE(client_enabled, true);
  ELSE
    -- Admins always have access
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get platform access settings (for admin UI)
CREATE OR REPLACE FUNCTION get_platform_access_settings()
RETURNS jsonb AS $$
DECLARE
  settings jsonb;
BEGIN
  SELECT setting_value INTO settings
  FROM app_settings 
  WHERE setting_key = 'platform_access_control';
  
  RETURN COALESCE(settings, '{"trainer_access_enabled": true, "client_access_enabled": true}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update platform access settings (for admin UI)
CREATE OR REPLACE FUNCTION update_platform_access_settings(
  trainer_enabled boolean,
  client_enabled boolean
)
RETURNS void AS $$
BEGIN
  INSERT INTO app_settings (setting_key, setting_value, updated_by)
  VALUES (
    'platform_access_control',
    jsonb_build_object(
      'trainer_access_enabled', trainer_enabled,
      'client_access_enabled', client_enabled
    ),
    auth.uid()
  )
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = jsonb_build_object(
      'trainer_access_enabled', trainer_enabled,
      'client_access_enabled', client_enabled
    ),
    updated_at = now(),
    updated_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark profile as completed (sets timestamp)
CREATE OR REPLACE FUNCTION mark_profile_completed(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    profile_setup_completed = true,
    date_profile_completed = COALESCE(date_profile_completed, now())
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION can_user_access_platform(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_access_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION update_platform_access_settings(boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_profile_completed(uuid) TO authenticated;