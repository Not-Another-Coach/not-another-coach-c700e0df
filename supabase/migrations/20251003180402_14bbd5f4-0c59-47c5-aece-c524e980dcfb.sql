-- Add 'client_shortlisted' to the allowed alert types
ALTER TABLE public.alerts 
DROP CONSTRAINT IF EXISTS alerts_alert_type_check;

ALTER TABLE public.alerts
ADD CONSTRAINT alerts_alert_type_check
CHECK (
  alert_type = ANY (
    ARRAY[
      'discovery_call_booked'::text,
      'discovery_call_cancelled'::text,
      'discovery_call_rescheduled'::text,
      'coach_selection_request'::text,
      'coach_selection_sent'::text,
      'waitlist_joined'::text,
      'waitlist_left'::text,
      'verification_request'::text,
      'verification_update'::text,
      'coach_update'::text,
      'waitlist_exclusive_access'::text,
      'waitlist_exclusivity_ended'::text,
      'document_submission'::text,
      'profile_published'::text,
      'client_shortlisted'::text
    ]
  )
);