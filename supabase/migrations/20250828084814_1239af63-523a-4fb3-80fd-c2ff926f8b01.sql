-- Add new engagement stages to the enum
ALTER TYPE engagement_stage ADD VALUE 'agreed';
ALTER TYPE engagement_stage ADD VALUE 'payment_pending';

-- Update existing 'matched' records to 'agreed' to maintain semantic clarity
UPDATE client_trainer_engagement 
SET stage = 'agreed' 
WHERE stage = 'matched';

-- Update the update_engagement_stage function to handle the new stages
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
    matched_at = CASE WHEN new_stage IN ('agreed', 'payment_pending', 'active_client') AND client_trainer_engagement.matched_at IS NULL THEN now() ELSE client_trainer_engagement.matched_at END,
    discovery_completed_at = CASE WHEN new_stage = 'discovery_completed' AND client_trainer_engagement.discovery_completed_at IS NULL THEN now() ELSE client_trainer_engagement.discovery_completed_at END,
    became_client_at = CASE WHEN new_stage = 'active_client' AND client_trainer_engagement.became_client_at IS NULL THEN now() ELSE client_trainer_engagement.became_client_at END;
END;
$function$;