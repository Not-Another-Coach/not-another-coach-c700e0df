-- Add columns to coach_availability_settings for waitlist exclusivity
ALTER TABLE public.coach_availability_settings 
ADD COLUMN waitlist_exclusive_until timestamp with time zone,
ADD COLUMN waitlist_exclusive_active boolean DEFAULT false;

-- Create table to track waitlist exclusive access periods
CREATE TABLE public.waitlist_exclusive_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on waitlist_exclusive_periods
ALTER TABLE public.waitlist_exclusive_periods ENABLE ROW LEVEL SECURITY;

-- Create policies for waitlist_exclusive_periods
CREATE POLICY "Coaches can manage their own exclusive periods" 
ON public.waitlist_exclusive_periods 
FOR ALL 
USING (auth.uid() = coach_id);

CREATE POLICY "Clients can view active exclusive periods" 
ON public.waitlist_exclusive_periods 
FOR SELECT 
USING (is_active = true AND expires_at > now());

-- Create function to start waitlist exclusive period
CREATE OR REPLACE FUNCTION public.start_waitlist_exclusive_period(p_coach_id uuid, p_duration_hours integer DEFAULT 48)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  period_id uuid;
  expires_at timestamp with time zone;
BEGIN
  -- Only the coach can start their own exclusive period
  IF auth.uid() != p_coach_id THEN
    RAISE EXCEPTION 'Unauthorized: Only coaches can start their own exclusive periods';
  END IF;

  -- Calculate expiry time
  expires_at := now() + (p_duration_hours || ' hours')::interval;

  -- End any existing active periods for this coach
  UPDATE public.waitlist_exclusive_periods
  SET is_active = false, updated_at = now()
  WHERE coach_id = p_coach_id AND is_active = true;

  -- Create new exclusive period
  INSERT INTO public.waitlist_exclusive_periods (coach_id, expires_at)
  VALUES (p_coach_id, expires_at)
  RETURNING id INTO period_id;

  -- Update coach availability settings
  UPDATE public.coach_availability_settings
  SET 
    waitlist_exclusive_until = expires_at,
    waitlist_exclusive_active = true,
    availability_status = 'accepting',
    updated_at = now()
  WHERE coach_id = p_coach_id;

  -- Create alert for waitlist clients
  INSERT INTO public.alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active,
    expires_at
  )
  SELECT 
    'waitlist_exclusive_access',
    'Early Access Available!',
    'You''ve got early access to ' || COALESCE(p.first_name || ' ' || p.last_name, 'a trainer') || ' — grab your spot before it opens up!',
    jsonb_build_object('waitlist_clients', jsonb_agg(cw.client_id)),
    jsonb_build_object(
      'coach_id', p_coach_id,
      'exclusive_period_id', period_id,
      'expires_at', expires_at
    ),
    true,
    expires_at
  FROM public.coach_waitlists cw
  JOIN public.profiles p ON p.id = p_coach_id
  WHERE cw.coach_id = p_coach_id 
    AND cw.status = 'active'
  GROUP BY p.first_name, p.last_name
  HAVING count(cw.client_id) > 0;

  RETURN period_id;
END;
$function$;

-- Create function to end waitlist exclusive period
CREATE OR REPLACE FUNCTION public.end_waitlist_exclusive_period(p_coach_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  coach_name text;
BEGIN
  -- Get coach name for notification
  SELECT COALESCE(first_name || ' ' || last_name, 'Coach') INTO coach_name
  FROM public.profiles 
  WHERE id = p_coach_id;

  -- End exclusive period
  UPDATE public.waitlist_exclusive_periods
  SET is_active = false, updated_at = now()
  WHERE coach_id = p_coach_id AND is_active = true;

  -- Update coach availability settings
  UPDATE public.coach_availability_settings
  SET 
    waitlist_exclusive_until = null,
    waitlist_exclusive_active = false,
    updated_at = now()
  WHERE coach_id = p_coach_id;

  -- Deactivate waitlist exclusive access alerts
  UPDATE public.alerts
  SET is_active = false, updated_at = now()
  WHERE alert_type = 'waitlist_exclusive_access'
    AND (metadata->>'coach_id')::uuid = p_coach_id
    AND is_active = true;

  -- Create notification for trainer
  INSERT INTO public.alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'waitlist_exclusivity_ended',
    'Waitlist Exclusivity Ended',
    'Your new availability is now public to all clients.',
    jsonb_build_object('coaches', jsonb_build_array(p_coach_id)),
    jsonb_build_object('coach_id', p_coach_id),
    true
  );
END;
$function$;

-- Create function to check if client has waitlist exclusive access
CREATE OR REPLACE FUNCTION public.client_has_waitlist_exclusive_access(p_client_id uuid, p_coach_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.coach_waitlists cw
    JOIN public.waitlist_exclusive_periods wep ON wep.coach_id = cw.coach_id
    WHERE cw.client_id = p_client_id 
      AND cw.coach_id = p_coach_id
      AND cw.status = 'active'
      AND wep.is_active = true
      AND wep.expires_at > now()
  );
END;
$function$;

-- Add trigger to automatically end expired exclusive periods
CREATE OR REPLACE FUNCTION public.auto_end_expired_exclusive_periods()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  expired_period RECORD;
BEGIN
  -- Find and process expired periods
  FOR expired_period IN 
    SELECT coach_id
    FROM public.waitlist_exclusive_periods
    WHERE is_active = true 
      AND expires_at <= now()
  LOOP
    PERFORM public.end_waitlist_exclusive_period(expired_period.coach_id);
  END LOOP;
END;
$function$;