-- Update RLS policy to allow system to create coach selection alerts
DROP POLICY IF EXISTS "System can create discovery call alerts" ON public.alerts;

CREATE POLICY "System can create alerts" ON public.alerts
FOR INSERT
WITH CHECK (
  alert_type = ANY (ARRAY[
    'discovery_call_booked'::text, 
    'discovery_call_cancelled'::text, 
    'discovery_call_rescheduled'::text,
    'coach_selection_request'::text,
    'coach_selection_sent'::text,
    'waitlist_joined'::text,
    'verification_request'::text,
    'verification_update'::text
  ])
);