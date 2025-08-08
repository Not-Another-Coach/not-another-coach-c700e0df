-- Update the function to handle discovery call cancellation
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
  
  -- When a discovery call is cancelled, revert engagement stage to shortlisted
  IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'shortlisted',
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id
      AND stage = 'discovery_call_booked';
      
    RAISE NOTICE 'Discovery call cancelled trigger fired for client % trainer %, reverted to shortlisted', NEW.client_id, NEW.trainer_id;
  END IF;
  
  RETURN NEW;
END;
$function$;