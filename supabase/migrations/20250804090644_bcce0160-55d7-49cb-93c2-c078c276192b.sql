-- Fix security warnings by updating function search paths

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::public.user_type, 'client'),
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Update the check_trainer_profile_completion function
CREATE OR REPLACE FUNCTION public.check_trainer_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only check for trainers
  IF NEW.user_type = 'trainer' THEN
    NEW.profile_setup_completed := (
      NEW.first_name IS NOT NULL AND
      NEW.last_name IS NOT NULL AND
      NEW.tagline IS NOT NULL AND
      NEW.location IS NOT NULL AND
      NEW.training_types IS NOT NULL AND array_length(NEW.training_types, 1) > 0 AND
      NEW.specializations IS NOT NULL AND array_length(NEW.specializations, 1) > 0 AND
      NEW.ideal_client_types IS NOT NULL AND array_length(NEW.ideal_client_types, 1) > 0 AND
      NEW.coaching_styles IS NOT NULL AND array_length(NEW.coaching_styles, 1) > 0 AND
      NEW.bio IS NOT NULL AND
      NEW.hourly_rate IS NOT NULL AND
      NEW.terms_agreed = true
    );
    
    -- Profile can only be published if setup is complete and verified
    IF NEW.profile_setup_completed = true AND NEW.verification_status = 'verified' THEN
      NEW.profile_published := true;
    ELSE
      NEW.profile_published := false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the check_client_survey_completion function
CREATE OR REPLACE FUNCTION public.check_client_survey_completion()
RETURNS trigger
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