-- Fix the update_engagement_stage function to use EXCLUDED instead of OLD
CREATE OR REPLACE FUNCTION public.update_engagement_stage(client_uuid uuid, trainer_uuid uuid, new_stage engagement_stage)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.client_trainer_engagement (client_id, trainer_id, stage)
  VALUES (client_uuid, trainer_uuid, new_stage)
  ON CONFLICT (client_id, trainer_id)
  DO UPDATE SET 
    stage = new_stage,
    updated_at = now(),
    liked_at = CASE WHEN new_stage = 'liked' AND client_trainer_engagement.liked_at IS NULL THEN now() ELSE client_trainer_engagement.liked_at END,
    matched_at = CASE WHEN new_stage = 'matched' AND client_trainer_engagement.matched_at IS NULL THEN now() ELSE client_trainer_engagement.matched_at END,
    discovery_completed_at = CASE WHEN new_stage = 'discovery_completed' AND client_trainer_engagement.discovery_completed_at IS NULL THEN now() ELSE client_trainer_engagement.discovery_completed_at END,
    became_client_at = CASE WHEN new_stage = 'active_client' AND client_trainer_engagement.became_client_at IS NULL THEN now() ELSE client_trainer_engagement.became_client_at END;
END;
$function$;