-- Fix platform access function to properly check client access
-- The issue: clients were being grandfathered in due to profile_setup_completed = false
-- which was intended for trainers who need to complete their profile setup

CREATE OR REPLACE FUNCTION public.can_user_access_platform(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_profile RECORD;
  v_access_settings JSONB;
  v_trainer_access_enabled BOOLEAN;
  v_client_access_enabled BOOLEAN;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = user_id;

  -- If no profile, deny access
  IF v_profile IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get access settings from platform_access_control
  SELECT setting_value INTO v_access_settings
  FROM app_settings
  WHERE setting_key = 'platform_access_control';

  -- Extract individual flags (default to true if not set)
  v_trainer_access_enabled := COALESCE((v_access_settings->>'trainer_access_enabled')::boolean, true);
  v_client_access_enabled := COALESCE((v_access_settings->>'client_access_enabled')::boolean, true);

  -- Check if admin (always allow)
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = v_profile.id 
    AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Handle trainers: Allow access if profile setup is incomplete (so they can complete it)
  IF v_profile.user_type = 'trainer' THEN
    -- Allow if profile setup is incomplete
    IF v_profile.profile_setup_completed = FALSE THEN
      RETURN TRUE;
    END IF;
    
    -- Grandfathering: Allow if date_profile_completed is NULL
    IF v_profile.date_profile_completed IS NULL THEN
      RETURN TRUE;
    END IF;
    
    -- Otherwise check the platform-wide setting
    RETURN v_trainer_access_enabled;
  END IF;

  -- Handle clients: Check platform-wide setting directly (no grandfathering)
  IF v_profile.user_type = 'client' THEN
    RETURN v_client_access_enabled;
  END IF;

  -- Default deny for any other user type
  RETURN FALSE;
END;
$$;