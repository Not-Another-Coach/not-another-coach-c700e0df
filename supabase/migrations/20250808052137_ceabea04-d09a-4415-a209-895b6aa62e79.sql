-- Fix the trigger to properly update engagement stage on discovery call booking
-- First, let's manually fix this specific case
UPDATE client_trainer_engagement 
SET stage = 'discovery_call_booked', updated_at = now()
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
  AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003'
  AND stage = 'matched';

-- Now let's recreate the trigger to be more robust
DROP TRIGGER IF EXISTS trigger_update_engagement_on_discovery_call_booking ON discovery_calls;

CREATE OR REPLACE FUNCTION public.update_engagement_on_discovery_call_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When a discovery call is created (booked), update engagement to discovery_call_booked
  IF TG_OP = 'INSERT' THEN
    -- Update engagement stage for any stage except 'active_client'
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'discovery_call_booked', 
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id 
      AND stage != 'active_client'
      AND stage != 'discovery_call_booked';
    
    -- Log for debugging
    RAISE NOTICE 'Discovery call booked trigger fired for client % trainer %', NEW.client_id, NEW.trainer_id;
  END IF;
  
  -- When a discovery call is completed, update engagement to discovery_completed
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'discovery_completed', 
      discovery_completed_at = now(),
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id;
      
    RAISE NOTICE 'Discovery call completed trigger fired for client % trainer %', NEW.client_id, NEW.trainer_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER trigger_update_engagement_on_discovery_call_booking
  AFTER INSERT OR UPDATE ON discovery_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_engagement_on_discovery_call_booking();