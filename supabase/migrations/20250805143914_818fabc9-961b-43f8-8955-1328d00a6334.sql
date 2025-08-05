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