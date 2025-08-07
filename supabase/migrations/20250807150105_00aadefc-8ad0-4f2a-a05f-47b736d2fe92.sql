-- Create alert for new coach selection request
CREATE OR REPLACE FUNCTION public.create_coach_selection_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  client_name TEXT;
  trainer_name TEXT;
BEGIN
  -- Get client and trainer names from profiles
  SELECT COALESCE(first_name || ' ' || last_name, 'A client') INTO client_name
  FROM public.profiles 
  WHERE id = NEW.client_id;
  
  SELECT COALESCE(first_name || ' ' || last_name, 'Coach') INTO trainer_name
  FROM public.profiles 
  WHERE id = NEW.trainer_id;
  
  -- Create alert for the trainer when new request is made
  INSERT INTO public.alerts (
    alert_type,
    title,
    content,
    created_by,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'coach_selection_request',
    'New Coach Selection Request',
    client_name || ' has selected you as their coach for ' || NEW.package_name || ' ($' || NEW.package_price || ')',
    NEW.trainer_id, -- Set the trainer as the target
    jsonb_build_object('coaches', jsonb_build_array(NEW.trainer_id)),
    jsonb_build_object(
      'client_id', NEW.client_id,
      'trainer_id', NEW.trainer_id,
      'request_id', NEW.id,
      'package_name', NEW.package_name,
      'package_price', NEW.package_price,
      'client_message', NEW.client_message
    ),
    true
  );

  -- Create alert for the client confirming their request was sent
  INSERT INTO public.alerts (
    alert_type,
    title,
    content,
    created_by,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'coach_selection_sent',
    'Coach Selection Request Sent',
    'Your request to work with ' || trainer_name || ' has been sent successfully',
    NEW.client_id, -- Set the client as the target
    jsonb_build_object('clients', jsonb_build_array(NEW.client_id)),
    jsonb_build_object(
      'client_id', NEW.client_id,
      'trainer_id', NEW.trainer_id,
      'request_id', NEW.id,
      'package_name', NEW.package_name,
      'package_price', NEW.package_price
    ),
    true
  );
  
  RETURN NEW;
END;
$function$

-- Create trigger to automatically create alerts when a coach selection request is made
CREATE TRIGGER trigger_coach_selection_alert
  AFTER INSERT ON public.coach_selection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_coach_selection_alert();