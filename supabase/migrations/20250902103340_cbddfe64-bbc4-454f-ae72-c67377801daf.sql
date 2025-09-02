-- Fix security issues - drop triggers first, then functions

-- Drop triggers first
DROP TRIGGER IF EXISTS update_trainer_profiles_updated_at ON public.trainer_profiles;
DROP TRIGGER IF EXISTS update_client_profiles_updated_at ON public.client_profiles;
DROP TRIGGER IF EXISTS create_domain_profile_on_insert ON public.profiles;

-- Now drop functions
DROP FUNCTION IF EXISTS update_trainer_profile_updated_at();
DROP FUNCTION IF EXISTS update_client_profile_updated_at();
DROP FUNCTION IF EXISTS create_domain_profile();

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION update_trainer_profile_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_client_profile_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_domain_profile()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_type = 'trainer' THEN
    INSERT INTO public.trainer_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  ELSIF NEW.user_type = 'client' THEN
    INSERT INTO public.client_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_trainer_profiles_updated_at
  BEFORE UPDATE ON public.trainer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_trainer_profile_updated_at();

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_client_profile_updated_at();

CREATE TRIGGER create_domain_profile_on_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_domain_profile();