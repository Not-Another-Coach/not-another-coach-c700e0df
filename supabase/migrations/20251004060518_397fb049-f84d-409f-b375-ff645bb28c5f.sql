-- Fix Client 2's data inconsistency
UPDATE client_profiles 
SET client_survey_completed = true,
    updated_at = now()
WHERE id = '95050edb-5a62-47eb-a014-947b4c20daaf'
  AND client_survey_completed = false;

-- Enhance RPC function to check engagement timestamps as fallback
CREATE OR REPLACE FUNCTION public.get_client_journey_stage(p_client_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  survey_completed boolean := false;
  has_advanced_engagement boolean := false;
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
  
  -- Check if client has advanced engagement timestamps (fallback for data inconsistency)
  SELECT EXISTS(
    SELECT 1 
    FROM client_trainer_engagement cte 
    WHERE cte.client_id = p_client_id 
    AND (cte.discovery_completed_at IS NOT NULL 
         OR cte.matched_at IS NOT NULL 
         OR cte.became_client_at IS NOT NULL)
  ) INTO has_advanced_engagement;
  
  -- If survey not completed AND no advanced engagement, return profile_setup
  IF NOT COALESCE(survey_completed, false) AND NOT COALESCE(has_advanced_engagement, false) THEN
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
  
  -- If no engagements exist but survey is complete or has advanced timestamps, return exploring_coaches
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