-- Step 1: Enhance the engagement_stage enum with comprehensive journey stages
ALTER TYPE engagement_stage ADD VALUE IF NOT EXISTS 'preferences_identified';
ALTER TYPE engagement_stage ADD VALUE IF NOT EXISTS 'exploring_coaches';
ALTER TYPE engagement_stage ADD VALUE IF NOT EXISTS 'discovery_scheduled';
ALTER TYPE engagement_stage ADD VALUE IF NOT EXISTS 'coach_chosen';
ALTER TYPE engagement_stage ADD VALUE IF NOT EXISTS 'onboarding_in_progress';
ALTER TYPE engagement_stage ADD VALUE IF NOT EXISTS 'goal_achieved';
ALTER TYPE engagement_stage ADD VALUE IF NOT EXISTS 'relationship_ended';

-- Step 2: Create function to get client's overall journey stage
CREATE OR REPLACE FUNCTION public.get_client_journey_stage(p_client_id uuid)
RETURNS engagement_stage
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  highest_stage engagement_stage;
BEGIN
  -- Get the highest engagement stage for this client across all trainers
  SELECT stage INTO highest_stage
  FROM public.client_trainer_engagement
  WHERE client_id = p_client_id
  ORDER BY 
    CASE stage
      WHEN 'goal_achieved' THEN 12
      WHEN 'active_client' THEN 11
      WHEN 'onboarding_in_progress' THEN 10
      WHEN 'coach_chosen' THEN 9
      WHEN 'agreed' THEN 8
      WHEN 'payment_pending' THEN 8
      WHEN 'discovery_completed' THEN 7
      WHEN 'discovery_in_progress' THEN 6
      WHEN 'discovery_scheduled' THEN 5
      WHEN 'getting_to_know_your_coach' THEN 4
      WHEN 'matched' THEN 4
      WHEN 'shortlisted' THEN 3
      WHEN 'liked' THEN 2
      WHEN 'browsing' THEN 1
      ELSE 0
    END DESC
  LIMIT 1;
  
  -- If no engagement records exist, check if they completed the survey
  IF highest_stage IS NULL THEN
    SELECT CASE 
      WHEN client_survey_completed = true THEN 'exploring_coaches'::engagement_stage
      ELSE 'browsing'::engagement_stage
    END INTO highest_stage
    FROM public.profiles
    WHERE id = p_client_id AND user_type = 'client';
  END IF;
  
  RETURN COALESCE(highest_stage, 'browsing'::engagement_stage);
END;
$$;

-- Step 3: Create function to get client operational status (fixed syntax)
CREATE OR REPLACE FUNCTION public.get_client_status(p_client_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  journey_stage engagement_stage;
  result_status text;
BEGIN
  journey_stage := public.get_client_journey_stage(p_client_id);
  
  result_status := CASE 
    WHEN journey_stage = 'browsing' THEN 'needs_survey'
    WHEN journey_stage = 'exploring_coaches' THEN 'survey_completed'
    WHEN journey_stage IN ('liked', 'shortlisted') THEN 'exploring'
    WHEN journey_stage IN ('getting_to_know_your_coach', 'matched', 'discovery_scheduled', 'discovery_in_progress') THEN 'in_discovery'
    WHEN journey_stage IN ('discovery_completed', 'agreed', 'payment_pending') THEN 'selecting_coach'
    WHEN journey_stage IN ('coach_chosen', 'onboarding_in_progress') THEN 'coach_selected'
    WHEN journey_stage = 'active_client' THEN 'active_training'
    WHEN journey_stage = 'goal_achieved' THEN 'goals_achieved'
    WHEN journey_stage = 'relationship_ended' THEN 'completed'
    WHEN journey_stage IN ('declined', 'unmatched') THEN 'needs_new_match'
    ELSE 'unknown'
  END;
  
  RETURN result_status;
END;
$$;