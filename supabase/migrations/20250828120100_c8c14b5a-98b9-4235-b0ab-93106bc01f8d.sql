-- Create function to fix Client Lou's status by updating engagement to coach_chosen
CREATE OR REPLACE FUNCTION public.fix_client_lou_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  client_lou_id uuid;
  trainer_lou_id uuid;
BEGIN
  -- Find Client Lou and Trainer Lou IDs
  SELECT id INTO client_lou_id 
  FROM public.profiles 
  WHERE first_name ILIKE '%lou%' AND user_type = 'client'
  LIMIT 1;

  SELECT id INTO trainer_lou_id 
  FROM public.profiles 
  WHERE first_name ILIKE '%lou%' AND user_type = 'trainer'
  LIMIT 1;

  -- If both found, update their engagement to active_client (which maps to "coach_chosen"/"on_your_journey")
  IF client_lou_id IS NOT NULL AND trainer_lou_id IS NOT NULL THEN
    -- Update engagement stage to active_client
    PERFORM public.update_engagement_stage(
      client_lou_id,
      trainer_lou_id,
      'active_client'::engagement_stage
    );
    
    -- Update coach selection request status to completed
    UPDATE public.coach_selection_requests
    SET 
      status = 'completed',
      updated_at = now()
    WHERE client_id = client_lou_id 
      AND trainer_id = trainer_lou_id
      AND status = 'awaiting_payment';

    RAISE NOTICE 'Fixed Client Lou status - moved to active_client with Trainer Lou';
  ELSE
    RAISE NOTICE 'Could not find Client Lou (%) or Trainer Lou (%)', client_lou_id, trainer_lou_id;
  END IF;
END;
$$;

-- Run the fix immediately  
SELECT public.fix_client_lou_status();