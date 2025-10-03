-- Add package_currency column to coach_selection_requests table
ALTER TABLE public.coach_selection_requests 
ADD COLUMN IF NOT EXISTS package_currency TEXT DEFAULT 'GBP';

-- Add suggested_alternative_package_currency column for alternative suggestions
ALTER TABLE public.coach_selection_requests 
ADD COLUMN IF NOT EXISTS suggested_alternative_package_currency TEXT;

-- Update the create_coach_selection_request function to include currency
CREATE OR REPLACE FUNCTION public.create_coach_selection_request(
  p_trainer_id UUID,
  p_package_id TEXT,
  p_package_name TEXT,
  p_package_price NUMERIC,
  p_package_duration TEXT,
  p_package_currency TEXT DEFAULT 'GBP',
  p_client_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id UUID;
BEGIN
  -- Insert the selection request
  INSERT INTO public.coach_selection_requests (
    client_id,
    trainer_id,
    package_id,
    package_name,
    package_price,
    package_currency,
    package_duration,
    client_message
  )
  VALUES (
    auth.uid(),
    p_trainer_id,
    p_package_id,
    p_package_name,
    p_package_price,
    p_package_currency,
    p_package_duration,
    p_client_message
  )
  ON CONFLICT (client_id, trainer_id)
  DO UPDATE SET
    package_id = EXCLUDED.package_id,
    package_name = EXCLUDED.package_name,
    package_price = EXCLUDED.package_price,
    package_currency = EXCLUDED.package_currency,
    package_duration = EXCLUDED.package_duration,
    client_message = EXCLUDED.client_message,
    status = 'pending',
    trainer_response = NULL,
    suggested_alternative_package_id = NULL,
    suggested_alternative_package_name = NULL,
    suggested_alternative_package_price = NULL,
    suggested_alternative_package_currency = NULL,
    responded_at = NULL,
    updated_at = now()
  RETURNING id INTO request_id;

  -- Update engagement stage to indicate coach has been chosen
  PERFORM public.update_engagement_stage(auth.uid(), p_trainer_id, 'shortlisted');

  RETURN request_id;
END;
$$;