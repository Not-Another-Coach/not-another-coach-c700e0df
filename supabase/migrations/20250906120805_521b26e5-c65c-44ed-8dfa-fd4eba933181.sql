-- Create RPC function to get client journey stage
CREATE OR REPLACE FUNCTION public.get_client_journey_stage(p_client_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  survey_completed boolean := false;
  most_advanced_stage text := null;
  stage_priority_map jsonb := '{
    "browsing": 1,
    "liked": 2, 
    "shortlisted": 3,
    "discovery_in_progress": 4,
    "discovery_call_booked": 5,
    "discovery_completed": 6,
    "waitlist": 7,
    "active_client": 8
  }';
  max_priority integer := 0;
  current_priority integer;
BEGIN
  -- Check if client has completed survey
  SELECT cp.client_survey_completed INTO survey_completed
  FROM client_profiles cp
  WHERE cp.id = p_client_id;
  
  -- If survey not completed, return profile_setup
  IF NOT COALESCE(survey_completed, false) THEN
    RETURN 'profile_setup';
  END IF;
  
  -- Get the most advanced engagement stage
  FOR most_advanced_stage IN 
    SELECT DISTINCT cte.stage 
    FROM client_trainer_engagement cte 
    WHERE cte.client_id = p_client_id
  LOOP
    current_priority := (stage_priority_map ->> most_advanced_stage)::integer;
    IF current_priority > max_priority THEN
      max_priority := current_priority;
    END IF;
  END LOOP;
  
  -- If no engagements exist but survey is complete, return exploring_coaches
  IF max_priority = 0 THEN
    RETURN 'exploring_coaches';
  END IF;
  
  -- Return the stage name based on max priority
  FOR most_advanced_stage IN 
    SELECT jsonb_object_keys(stage_priority_map)
  LOOP
    IF (stage_priority_map ->> most_advanced_stage)::integer = max_priority THEN
      RETURN most_advanced_stage;
    END IF;
  END LOOP;
  
  RETURN 'exploring_coaches';
END;
$$;

-- Create trigger function to auto-progress journey when survey is completed
CREATE OR REPLACE FUNCTION public.handle_survey_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When client survey is marked as completed, update their journey stage
  IF NEW.client_survey_completed = true AND (OLD.client_survey_completed IS NULL OR OLD.client_survey_completed = false) THEN
    -- Update client journey stage in profiles
    UPDATE profiles 
    SET journey_stage = 'exploring_coaches',
        updated_at = now()
    WHERE id = NEW.id AND user_type = 'client';
    
    -- Update client journey stage in client_profiles
    NEW.client_journey_stage = 'exploring_coaches';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for survey completion
DROP TRIGGER IF EXISTS trigger_survey_completion ON client_profiles;
CREATE TRIGGER trigger_survey_completion
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_survey_completion();

-- Migrate existing clients who have completed survey but don't have proper journey stage
UPDATE profiles 
SET journey_stage = 'exploring_coaches',
    updated_at = now()
WHERE id IN (
  SELECT p.id 
  FROM profiles p
  JOIN client_profiles cp ON p.id = cp.id
  WHERE p.user_type = 'client' 
    AND cp.client_survey_completed = true
    AND (p.journey_stage IS NULL OR p.journey_stage = 'profile_setup')
);

UPDATE client_profiles 
SET client_journey_stage = 'exploring_coaches',
    updated_at = now()
WHERE id IN (
  SELECT cp.id 
  FROM client_profiles cp
  JOIN profiles p ON cp.id = p.id
  WHERE p.user_type = 'client' 
    AND cp.client_survey_completed = true
    AND (cp.client_journey_stage IS NULL OR cp.client_journey_stage = 'profile_setup')
);