-- Fix security warnings by setting search_path for all functions

-- Update get_engagement_stage function
CREATE OR REPLACE FUNCTION public.get_engagement_stage(client_uuid UUID, trainer_uuid UUID)
RETURNS engagement_stage
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_stage engagement_stage;
BEGIN
  SELECT stage INTO current_stage
  FROM public.client_trainer_engagement
  WHERE client_id = client_uuid AND trainer_id = trainer_uuid;
  
  -- Return 'browsing' if no engagement record exists
  RETURN COALESCE(current_stage, 'browsing');
END;
$$;

-- Update update_engagement_stage function
CREATE OR REPLACE FUNCTION public.update_engagement_stage(
  client_uuid UUID, 
  trainer_uuid UUID, 
  new_stage engagement_stage
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.client_trainer_engagement (client_id, trainer_id, stage)
  VALUES (client_uuid, trainer_uuid, new_stage)
  ON CONFLICT (client_id, trainer_id)
  DO UPDATE SET 
    stage = new_stage,
    updated_at = now(),
    liked_at = CASE WHEN new_stage = 'liked' AND OLD.liked_at IS NULL THEN now() ELSE OLD.liked_at END,
    matched_at = CASE WHEN new_stage = 'matched' AND OLD.matched_at IS NULL THEN now() ELSE OLD.matched_at END,
    discovery_completed_at = CASE WHEN new_stage = 'discovery_completed' AND OLD.discovery_completed_at IS NULL THEN now() ELSE OLD.discovery_completed_at END,
    became_client_at = CASE WHEN new_stage = 'active_client' AND OLD.became_client_at IS NULL THEN now() ELSE OLD.became_client_at END;
END;
$$;