-- Fix the function parameter order to match what the frontend expects
DROP FUNCTION IF EXISTS public.create_coach_selection_request(text, text, text, text, numeric, uuid);

CREATE OR REPLACE FUNCTION public.create_coach_selection_request(
  p_client_message text DEFAULT NULL,
  p_package_duration text,
  p_package_id text,
  p_package_name text,
  p_package_price numeric,
  p_trainer_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id UUID;
  current_user_id UUID;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Add logging to see what we're working with
  RAISE LOG 'create_coach_selection_request called with trainer_id: %, client_id: %, package_id: %', 
    p_trainer_id, current_user_id, p_package_id;
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create selection request';
  END IF;
  
  -- Insert the selection request
  INSERT INTO public.coach_selection_requests (
    client_id,
    trainer_id,
    package_id,
    package_name,
    package_price,
    package_duration,
    client_message
  )
  VALUES (
    current_user_id,
    p_trainer_id,
    p_package_id,
    p_package_name,
    p_package_price,
    p_package_duration,
    p_client_message
  )
  ON CONFLICT (client_id, trainer_id)
  DO UPDATE SET
    package_id = EXCLUDED.package_id,
    package_name = EXCLUDED.package_name,
    package_price = EXCLUDED.package_price,
    package_duration = EXCLUDED.package_duration,
    client_message = EXCLUDED.client_message,
    status = 'pending',
    trainer_response = NULL,
    suggested_alternative_package_id = NULL,
    suggested_alternative_package_name = NULL,
    suggested_alternative_package_price = NULL,
    responded_at = NULL,
    updated_at = now()
  RETURNING id INTO request_id;

  -- Log successful creation
  RAISE LOG 'Successfully created selection request with ID: %', request_id;

  -- Update engagement stage to indicate coach has been chosen
  PERFORM public.update_engagement_stage(current_user_id, p_trainer_id, 'shortlisted');

  RETURN request_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.create_coach_selection_request(text, text, text, text, numeric, uuid) TO authenticated;