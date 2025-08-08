-- Add the new alert type to the alerts_alert_type_check constraint
ALTER TABLE public.alerts 
DROP CONSTRAINT IF EXISTS alerts_alert_type_check;

-- Add the updated constraint with the new waitlist exclusive access alert types
ALTER TABLE public.alerts 
ADD CONSTRAINT alerts_alert_type_check 
CHECK (alert_type = ANY (ARRAY[
  'discovery_call_booked'::text, 
  'discovery_call_cancelled'::text, 
  'discovery_call_rescheduled'::text, 
  'coach_selection_request'::text, 
  'coach_selection_sent'::text, 
  'waitlist_joined'::text, 
  'verification_request'::text, 
  'verification_update'::text,
  'coach_update'::text,
  'waitlist_exclusive_access'::text,
  'waitlist_exclusivity_ended'::text
]));