-- Add new engagement stage for when discovery call is booked
ALTER TYPE engagement_stage ADD VALUE 'discovery_call_booked' AFTER 'shortlisted';

-- Update the update_engagement_stage function to handle the new stage
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
    liked_at = CASE WHEN new_stage = 'liked' AND OLD.liked_at IS NULL THEN now() ELSE OLD.liked_at END,
    matched_at = CASE WHEN new_stage = 'matched' AND OLD.matched_at IS NULL THEN now() ELSE OLD.matched_at END,
    discovery_completed_at = CASE WHEN new_stage = 'discovery_completed' AND OLD.discovery_completed_at IS NULL THEN now() ELSE OLD.discovery_completed_at END,
    became_client_at = CASE WHEN new_stage = 'active_client' AND OLD.became_client_at IS NULL THEN now() ELSE OLD.became_client_at END;
END;
$function$;

-- Create trigger to automatically update engagement stage when discovery call is booked
CREATE OR REPLACE FUNCTION public.update_engagement_on_discovery_call_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When a discovery call is created (booked), update engagement to discovery_call_booked
  IF TG_OP = 'INSERT' THEN
    UPDATE public.client_trainer_engagement
    SET stage = 'discovery_call_booked', updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id 
      AND stage = 'shortlisted';
  END IF;
  
  -- When a discovery call is completed, update engagement to discovery_completed
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.client_trainer_engagement
    SET stage = 'discovery_completed', 
        discovery_completed_at = now(),
        updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger for discovery calls
DROP TRIGGER IF EXISTS trigger_update_engagement_on_discovery_call ON public.discovery_calls;
CREATE TRIGGER trigger_update_engagement_on_discovery_call
  AFTER INSERT OR UPDATE ON public.discovery_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_engagement_on_discovery_call_booking();

-- Update Lou Whitton's engagement stage since he has an active discovery call
UPDATE public.client_trainer_engagement 
SET stage = 'discovery_call_booked', updated_at = now()
WHERE trainer_id = (SELECT id FROM profiles WHERE first_name = 'Trainer Lou' AND last_name = 'Whitton')
  AND stage = 'shortlisted'
  AND EXISTS (
    SELECT 1 FROM discovery_calls dc 
    WHERE dc.trainer_id = client_trainer_engagement.trainer_id 
      AND dc.client_id = client_trainer_engagement.client_id 
      AND dc.status = 'scheduled'
  );