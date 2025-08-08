-- Fix security linter: set search_path and security definer on the new function
CREATE OR REPLACE FUNCTION public.update_trainer_onboarding_activities_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;