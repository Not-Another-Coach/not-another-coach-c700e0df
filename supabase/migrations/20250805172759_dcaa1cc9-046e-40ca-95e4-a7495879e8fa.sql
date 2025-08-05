-- Create table for tracking coach selection requests
CREATE TABLE public.coach_selection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  trainer_id UUID NOT NULL,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  package_price NUMERIC,
  package_duration TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined, alternative_suggested
  client_message TEXT,
  trainer_response TEXT,
  suggested_alternative_package_id TEXT,
  suggested_alternative_package_name TEXT,
  suggested_alternative_package_price NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(client_id, trainer_id) -- One active request per client-trainer pair
);

-- Enable RLS
ALTER TABLE public.coach_selection_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients can create their own requests" 
ON public.coach_selection_requests 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can view their own requests" 
ON public.coach_selection_requests 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Trainers can view requests for them" 
ON public.coach_selection_requests 
FOR SELECT 
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update requests for them" 
ON public.coach_selection_requests 
FOR UPDATE 
USING (auth.uid() = trainer_id);

CREATE POLICY "Clients can update their own requests" 
ON public.coach_selection_requests 
FOR UPDATE 
USING (auth.uid() = client_id);

-- Add updated_at trigger
CREATE TRIGGER update_coach_selection_requests_updated_at
  BEFORE UPDATE ON public.coach_selection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle coach selection with engagement stage update
CREATE OR REPLACE FUNCTION public.create_coach_selection_request(
  p_trainer_id UUID,
  p_package_id TEXT,
  p_package_name TEXT,
  p_package_price NUMERIC,
  p_package_duration TEXT,
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
    package_duration,
    client_message
  )
  VALUES (
    auth.uid(),
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

  -- Update engagement stage to indicate coach has been chosen
  PERFORM public.update_engagement_stage(auth.uid(), p_trainer_id, 'shortlisted');

  RETURN request_id;
END;
$$;