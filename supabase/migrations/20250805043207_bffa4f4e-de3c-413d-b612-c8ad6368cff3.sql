-- Update the alerts_alert_type_check constraint to include discovery call alert types
ALTER TABLE public.alerts 
DROP CONSTRAINT alerts_alert_type_check;

ALTER TABLE public.alerts 
ADD CONSTRAINT alerts_alert_type_check 
CHECK (alert_type = ANY (ARRAY[
  'coach_update'::text, 
  'platform_nudge'::text, 
  'system_alert'::text, 
  'achievement'::text, 
  'availability'::text,
  'discovery_call_booked'::text,
  'discovery_call_cancelled'::text,
  'discovery_call_rescheduled'::text,
  'client_inquiry'::text,
  'profile_view'::text,
  'testimonial'::text,
  'conversion'::text
]));