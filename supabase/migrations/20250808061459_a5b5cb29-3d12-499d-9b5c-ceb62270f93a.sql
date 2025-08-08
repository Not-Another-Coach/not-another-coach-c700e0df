-- Update the create_coach_selection_request function to use a more appropriate engagement stage
CREATE OR REPLACE FUNCTION public.create_coach_selection_request(p_trainer_id uuid, p_package_id text, p_package_name text, p_package_price numeric, p_package_duration text, p_client_message text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  request_id UUID;
  current_user_id UUID;
  current_stage engagement_stage;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create selection request';
  END IF;
  
  -- Get current engagement stage
  SELECT stage INTO current_stage
  FROM public.client_trainer_engagement
  WHERE client_id = current_user_id AND trainer_id = p_trainer_id;
  
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

  -- Update engagement stage to be more appropriate
  -- If currently discovery_completed, stay there; if discovery_in_progress, stay there; 
  -- otherwise set to discovery_in_progress to indicate coach selection is in progress
  IF current_stage = 'discovery_completed' THEN
    -- Keep discovery_completed status as they've completed the discovery process
    PERFORM public.update_engagement_stage(current_user_id, p_trainer_id, 'discovery_completed');
  ELSIF current_stage = 'discovery_in_progress' THEN
    -- Keep discovery_in_progress as they're still in that phase
    PERFORM public.update_engagement_stage(current_user_id, p_trainer_id, 'discovery_in_progress');
  ELSE
    -- For other stages (browsing, liked, shortlisted), move to discovery_in_progress
    -- to indicate they're in the coach selection process
    PERFORM public.update_engagement_stage(current_user_id, p_trainer_id, 'discovery_in_progress');
  END IF;

  RETURN request_id;
END;
$function$;