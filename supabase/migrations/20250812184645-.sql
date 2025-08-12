-- Phase 2: Idempotency & Event Safety

-- Create webhook events table for idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_event_id text NOT NULL UNIQUE, -- External provider's event ID (serves as idempotency key)
  provider_name text NOT NULL, -- 'stripe', 'sendgrid', 'twilio', 'resend', etc.
  event_type text NOT NULL, -- 'payment.succeeded', 'email.delivered', etc.
  webhook_signature text, -- For signature verification
  raw_payload jsonb NOT NULL, -- Complete webhook payload
  processed_at timestamp with time zone, -- When processing completed
  processing_status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'skipped'
  processing_attempts integer DEFAULT 0,
  last_processing_error text,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS on webhook events
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for webhook events
CREATE POLICY "System can manage webhook events" 
ON public.webhook_events 
FOR ALL 
USING (true); -- System-only table, no user access needed

CREATE POLICY "Admins can view webhook events" 
ON public.webhook_events 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_event_id ON public.webhook_events(provider_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_name ON public.webhook_events(provider_name);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_correlation_id ON public.webhook_events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_status ON public.webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at);

-- Add correlation IDs to existing workflow tables

-- Add to coach_selection_requests
ALTER TABLE public.coach_selection_requests ADD COLUMN IF NOT EXISTS correlation_id uuid DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_coach_selection_requests_correlation_id ON public.coach_selection_requests(correlation_id);

-- Add to discovery_calls
ALTER TABLE public.discovery_calls ADD COLUMN IF NOT EXISTS correlation_id uuid DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_discovery_calls_correlation_id ON public.discovery_calls(correlation_id);

-- Add to discovery_call_notifications
ALTER TABLE public.discovery_call_notifications ADD COLUMN IF NOT EXISTS correlation_id uuid DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_discovery_call_notifications_correlation_id ON public.discovery_call_notifications(correlation_id);

-- Add to discovery_call_feedback_notifications
ALTER TABLE public.discovery_call_feedback_notifications ADD COLUMN IF NOT EXISTS correlation_id uuid DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_discovery_call_feedback_notifications_correlation_id ON public.discovery_call_feedback_notifications(correlation_id);

-- Add to coach_waitlists
ALTER TABLE public.coach_waitlists ADD COLUMN IF NOT EXISTS correlation_id uuid DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_coach_waitlists_correlation_id ON public.coach_waitlists(correlation_id);

-- Add to waitlist_exclusive_periods
ALTER TABLE public.waitlist_exclusive_periods ADD COLUMN IF NOT EXISTS correlation_id uuid DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_waitlist_exclusive_periods_correlation_id ON public.waitlist_exclusive_periods(correlation_id);

-- Add to client_onboarding_progress
ALTER TABLE public.client_onboarding_progress ADD COLUMN IF NOT EXISTS correlation_id uuid DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_correlation_id ON public.client_onboarding_progress(correlation_id);

-- Add to alerts
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS correlation_id uuid DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_alerts_correlation_id ON public.alerts(correlation_id);

-- Create event processing state table for complex workflows
CREATE TABLE IF NOT EXISTS public.event_processing_state (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  correlation_id uuid NOT NULL UNIQUE,
  workflow_type text NOT NULL, -- 'onboarding', 'discovery_call', 'payment', etc.
  current_step text NOT NULL,
  total_steps integer NOT NULL DEFAULT 1,
  completed_steps integer NOT NULL DEFAULT 0,
  state_data jsonb NOT NULL DEFAULT '{}', -- Workflow-specific state
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  failed_at timestamp with time zone,
  failure_reason text,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  next_retry_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on event processing state
ALTER TABLE public.event_processing_state ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event processing state
CREATE POLICY "System can manage event processing state" 
ON public.event_processing_state 
FOR ALL 
USING (true); -- System-only table

CREATE POLICY "Admins can view event processing state" 
ON public.event_processing_state 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_processing_state_correlation_id ON public.event_processing_state(correlation_id);
CREATE INDEX IF NOT EXISTS idx_event_processing_state_workflow_type ON public.event_processing_state(workflow_type);
CREATE INDEX IF NOT EXISTS idx_event_processing_state_current_step ON public.event_processing_state(current_step);
CREATE INDEX IF NOT EXISTS idx_event_processing_state_next_retry_at ON public.event_processing_state(next_retry_at);

-- Create function to safely process webhook events (idempotent)
CREATE OR REPLACE FUNCTION public.process_webhook_event(
  p_provider_event_id text,
  p_provider_name text,
  p_event_type text,
  p_webhook_signature text,
  p_raw_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_event RECORD;
  event_id uuid;
  result jsonb;
BEGIN
  -- Check if event already exists (idempotency check)
  SELECT * INTO existing_event
  FROM public.webhook_events
  WHERE provider_event_id = p_provider_event_id;
  
  IF FOUND THEN
    -- Event already processed or in progress
    IF existing_event.processing_status = 'completed' THEN
      RETURN jsonb_build_object(
        'status', 'already_processed',
        'event_id', existing_event.id,
        'processed_at', existing_event.processed_at
      );
    ELSIF existing_event.processing_status = 'processing' THEN
      RETURN jsonb_build_object(
        'status', 'in_progress',
        'event_id', existing_event.id
      );
    ELSE
      -- Failed or pending, allow retry
      event_id := existing_event.id;
    END IF;
  ELSE
    -- Create new event record
    INSERT INTO public.webhook_events (
      provider_event_id,
      provider_name,
      event_type,
      webhook_signature,
      raw_payload,
      processing_status
    )
    VALUES (
      p_provider_event_id,
      p_provider_name,
      p_event_type,
      p_webhook_signature,
      p_raw_payload,
      'pending'
    )
    RETURNING id INTO event_id;
  END IF;
  
  -- Mark as processing
  UPDATE public.webhook_events
  SET 
    processing_status = 'processing',
    processing_attempts = processing_attempts + 1,
    updated_at = now()
  WHERE id = event_id;
  
  -- Return event info for further processing
  RETURN jsonb_build_object(
    'status', 'ready_to_process',
    'event_id', event_id,
    'provider_event_id', p_provider_event_id,
    'provider_name', p_provider_name,
    'event_type', p_event_type,
    'payload', p_raw_payload
  );
END;
$$;

-- Create function to mark webhook event as completed
CREATE OR REPLACE FUNCTION public.complete_webhook_event(
  p_event_id uuid,
  p_result jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.webhook_events
  SET 
    processing_status = 'completed',
    processed_at = now(),
    metadata = p_result,
    updated_at = now()
  WHERE id = p_event_id;
END;
$$;

-- Create function to mark webhook event as failed
CREATE OR REPLACE FUNCTION public.fail_webhook_event(
  p_event_id uuid,
  p_error_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.webhook_events
  SET 
    processing_status = 'failed',
    last_processing_error = p_error_message,
    updated_at = now()
  WHERE id = p_event_id;
END;
$$;

-- Create function to start workflow with correlation tracking
CREATE OR REPLACE FUNCTION public.start_workflow(
  p_workflow_type text,
  p_total_steps integer DEFAULT 1,
  p_initial_state jsonb DEFAULT '{}'::jsonb,
  p_correlation_id uuid DEFAULT gen_random_uuid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  state_id uuid;
BEGIN
  INSERT INTO public.event_processing_state (
    correlation_id,
    workflow_type,
    current_step,
    total_steps,
    state_data
  )
  VALUES (
    p_correlation_id,
    p_workflow_type,
    'started',
    p_total_steps,
    p_initial_state
  )
  RETURNING id INTO state_id;
  
  RETURN state_id;
END;
$$;

-- Create function to update workflow progress
CREATE OR REPLACE FUNCTION public.update_workflow_progress(
  p_correlation_id uuid,
  p_current_step text,
  p_state_data jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_state RECORD;
BEGIN
  -- Get current state
  SELECT * INTO current_state
  FROM public.event_processing_state
  WHERE correlation_id = p_correlation_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Update state
  UPDATE public.event_processing_state
  SET 
    current_step = p_current_step,
    completed_steps = completed_steps + 1,
    state_data = COALESCE(p_state_data, state_data),
    completed_at = CASE 
      WHEN completed_steps + 1 >= total_steps THEN now()
      ELSE completed_at
    END,
    updated_at = now()
  WHERE correlation_id = p_correlation_id;
  
  RETURN true;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_webhook_events_updated_at
  BEFORE UPDATE ON public.webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_event_processing_state_updated_at
  BEFORE UPDATE ON public.event_processing_state
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();