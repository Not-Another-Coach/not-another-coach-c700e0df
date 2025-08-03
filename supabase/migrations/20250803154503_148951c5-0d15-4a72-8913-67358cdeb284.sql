-- Fix function search path for security
CREATE OR REPLACE FUNCTION public.check_client_survey_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only check for clients
  IF NEW.user_type = 'client' THEN
    NEW.client_survey_completed := (
      NEW.primary_goals IS NOT NULL AND array_length(NEW.primary_goals, 1) > 0 AND
      NEW.training_location_preference IS NOT NULL AND
      NEW.preferred_training_frequency IS NOT NULL AND
      NEW.preferred_time_slots IS NOT NULL AND array_length(NEW.preferred_time_slots, 1) > 0 AND
      NEW.preferred_coaching_style IS NOT NULL AND array_length(NEW.preferred_coaching_style, 1) > 0 AND
      NEW.client_personality_type IS NOT NULL AND array_length(NEW.client_personality_type, 1) > 0 AND
      NEW.preferred_package_type IS NOT NULL
    );
    
    -- Set completion timestamp if just completed
    IF NEW.client_survey_completed = true AND (OLD.client_survey_completed IS NULL OR OLD.client_survey_completed = false) THEN
      NEW.client_survey_completed_at := now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;