-- Update alerts alert_type check constraint to include new types used by the app
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'alerts_alert_type_check' AND conrelid = 'public.alerts'::regclass
  ) THEN
    ALTER TABLE public.alerts DROP CONSTRAINT alerts_alert_type_check;
  END IF;
END $$;

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
      'profile_published'::text
    ]
  )
);
