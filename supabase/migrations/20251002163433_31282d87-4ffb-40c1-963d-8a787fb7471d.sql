-- Update the client_can_view_trainer_images function to include 'liked' stage
-- This allows clients who have liked a trainer to see their gallery images

CREATE OR REPLACE FUNCTION public.client_can_view_trainer_images(p_trainer_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- If no user is authenticated, deny access
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Trainers can always view their own images
  IF current_user_id = p_trainer_id THEN
    RETURN true;
  END IF;
  
  -- Check if the client has any active engagement with this trainer
  -- NOW INCLUDING 'liked' stage so saved trainers show gallery images
  RETURN EXISTS (
    SELECT 1 FROM client_trainer_engagement 
    WHERE client_id = current_user_id 
    AND trainer_id = p_trainer_id
    AND stage IN ('liked', 'shortlisted', 'discovery_call_booked', 'discovery_in_progress', 'discovery_completed', 'waitlist', 'active_client')
  ) OR EXISTS (
    -- Or has an active discovery call (past or future)
    SELECT 1 FROM discovery_calls 
    WHERE client_id = current_user_id 
    AND trainer_id = p_trainer_id
    AND status IN ('scheduled', 'completed')
  ) OR EXISTS (
    -- Or is on the trainer's waitlist
    SELECT 1 FROM coach_waitlists 
    WHERE client_id = current_user_id 
    AND coach_id = p_trainer_id 
    AND status = 'active'
  );
END;
$function$;