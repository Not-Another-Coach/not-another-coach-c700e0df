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

-- Step 3: Create function to get client operational status
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
  
  result_status := CASE journey_stage
    WHEN 'browsing' THEN 'needs_survey'
    WHEN 'exploring_coaches' THEN 'survey_completed'
    WHEN 'liked', 'shortlisted' THEN 'exploring'
    WHEN 'getting_to_know_your_coach', 'matched', 'discovery_scheduled', 'discovery_in_progress' THEN 'in_discovery'
    WHEN 'discovery_completed', 'agreed', 'payment_pending' THEN 'selecting_coach'
    WHEN 'coach_chosen', 'onboarding_in_progress' THEN 'coach_selected'
    WHEN 'active_client' THEN 'active_training'
    WHEN 'goal_achieved' THEN 'goals_achieved'
    WHEN 'relationship_ended' THEN 'completed'
    WHEN 'declined', 'unmatched' THEN 'needs_new_match'
    ELSE 'unknown'
  END;
  
  RETURN result_status;
END;
$$;

-- Step 4: Create computed view for client journey progress
CREATE OR REPLACE VIEW public.client_journey_progress_view AS
SELECT 
  p.id as client_id,
  public.get_client_journey_stage(p.id) as current_stage,
  public.get_client_status(p.id) as client_status,
  CASE 
    WHEN public.get_client_journey_stage(p.id) = 'browsing' THEN 10
    WHEN public.get_client_journey_stage(p.id) = 'exploring_coaches' THEN 20
    WHEN public.get_client_journey_stage(p.id) IN ('liked', 'shortlisted') THEN 30
    WHEN public.get_client_journey_stage(p.id) IN ('getting_to_know_your_coach', 'matched') THEN 40
    WHEN public.get_client_journey_stage(p.id) IN ('discovery_scheduled', 'discovery_in_progress') THEN 50
    WHEN public.get_client_journey_stage(p.id) IN ('discovery_completed', 'agreed') THEN 60
    WHEN public.get_client_journey_stage(p.id) = 'payment_pending' THEN 70
    WHEN public.get_client_journey_stage(p.id) = 'coach_chosen' THEN 80
    WHEN public.get_client_journey_stage(p.id) = 'onboarding_in_progress' THEN 90
    WHEN public.get_client_journey_stage(p.id) = 'active_client' THEN 100
    ELSE 0
  END as progress_percentage
FROM public.profiles p
WHERE p.user_type = 'client';

-- Step 5: Update engagement records to populate missing journey data
-- Migrate any clients who completed survey but have no engagement records
INSERT INTO public.client_trainer_engagement (client_id, trainer_id, stage, created_at, updated_at)
SELECT 
  p.id,
  p.id, -- Use client_id as trainer_id for general journey tracking (will be filtered out in queries)
  'exploring_coaches'::engagement_stage,
  now(),
  now()
FROM public.profiles p
WHERE p.user_type = 'client' 
  AND p.client_survey_completed = true
  AND NOT EXISTS (
    SELECT 1 FROM public.client_trainer_engagement cte 
    WHERE cte.client_id = p.id
  )
ON CONFLICT (client_id, trainer_id) DO NOTHING;

-- Step 6: Create trigger to auto-update journey stage when engagement changes
CREATE OR REPLACE FUNCTION public.update_client_journey_on_engagement_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- No need to update profile columns anymore since we use computed functions
  -- This trigger can be used for future enhancements if needed
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER update_client_journey_trigger
AFTER INSERT OR UPDATE ON public.client_trainer_engagement
FOR EACH ROW
EXECUTE FUNCTION public.update_client_journey_on_engagement_change();