-- Fix ambiguous column reference in can_user_access_platform function
-- Drop the function first, then recreate with p_user_id parameter

DROP FUNCTION IF EXISTS public.can_user_access_platform(uuid);

CREATE FUNCTION public.can_user_access_platform(p_user_id UUID)
RETURNS BOOLEAN
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
  -- Get user profile using renamed parameter
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  IF v_profile IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT setting_value INTO v_access_settings
  FROM app_settings
  WHERE setting_key = 'platform_access_control';

  v_trainer_access_enabled := COALESCE((v_access_settings->>'trainer_access_enabled')::boolean, true);
  v_client_access_enabled := COALESCE((v_access_settings->>'client_access_enabled')::boolean, true);

  -- Check if admin - now unambiguous with table.column qualification
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = v_profile.id 
    AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  IF v_profile.user_type = 'trainer' THEN
    IF v_profile.profile_setup_completed = FALSE THEN
      RETURN TRUE;
    END IF;
    IF v_profile.date_profile_completed IS NULL THEN
      RETURN TRUE;
    END IF;
    RETURN v_trainer_access_enabled;
  END IF;

  IF v_profile.user_type = 'client' THEN
    RETURN v_client_access_enabled;
  END IF;

  RETURN FALSE;
END;
$$;