-- Drop and recreate the waitlist join trigger to ensure it works properly
DROP TRIGGER IF EXISTS handle_waitlist_join_trigger ON coach_waitlists;

-- Recreate the trigger function with better logging
CREATE OR REPLACE FUNCTION public.handle_waitlist_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When someone joins a waitlist, update their engagement stage to 'waitlist'
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    -- Log for debugging
    RAISE NOTICE 'Waitlist join trigger fired for client % coach %', NEW.client_id, NEW.coach_id;
    
    INSERT INTO public.client_trainer_engagement (client_id, trainer_id, stage)
    VALUES (NEW.client_id, NEW.coach_id, 'waitlist')
    ON CONFLICT (client_id, trainer_id)
    DO UPDATE SET 
      stage = 'waitlist',
      updated_at = now();
      
    RAISE NOTICE 'Engagement updated to waitlist for client % coach %', NEW.client_id, NEW.coach_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER handle_waitlist_join_trigger
  AFTER INSERT ON public.coach_waitlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_waitlist_join();

-- Fix existing waitlist entries that have wrong engagement stages
UPDATE public.client_trainer_engagement 
SET stage = 'waitlist', updated_at = now()
WHERE (client_id, trainer_id) IN (
  SELECT cw.client_id, cw.coach_id 
  FROM coach_waitlists cw 
  WHERE cw.status = 'active'
) AND stage != 'waitlist';