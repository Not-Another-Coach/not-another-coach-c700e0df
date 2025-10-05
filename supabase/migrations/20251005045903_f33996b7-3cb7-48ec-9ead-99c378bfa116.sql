-- Update client_can_view_trainer_images to default to browsing when no engagement exists
CREATE OR REPLACE FUNCTION public.client_can_view_trainer_images(
  p_trainer_id uuid,
  p_client_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  engagement_stage engagement_stage;
BEGIN
  -- Get the engagement stage, default to 'browsing' if no row exists
  SELECT stage INTO engagement_stage
  FROM client_trainer_engagement
  WHERE client_id = p_client_id
    AND trainer_id = p_trainer_id;
  
  -- If no engagement found, treat as browsing
  IF engagement_stage IS NULL THEN
    engagement_stage := 'browsing'::engagement_stage;
  END IF;
  
  -- Check if the stage allows viewing images
  RETURN engagement_stage IN (
    'browsing',
    'liked',
    'shortlisted',
    'getting_to_know_your_coach',
    'discovery_in_progress',
    'matched',
    'discovery_completed',
    'agreed',
    'payment_pending',
    'active_client'
  );
END;
$$;