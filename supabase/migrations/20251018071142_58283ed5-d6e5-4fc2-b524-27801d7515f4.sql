-- Add 'plan_reactivated' to allowed alert types
ALTER TABLE public.alerts
DROP CONSTRAINT IF EXISTS alerts_alert_type_check;

ALTER TABLE public.alerts
ADD CONSTRAINT alerts_alert_type_check
CHECK (
  alert_type IN (
    'client_shortlisted',
    'coach_selection_request',
    'coach_selection_sent',
    'coach_update',
    'discovery_call_booked',
    'discovery_call_cancelled',
    'document_submission',
    'profile_published',
    'verification_update',
    'waitlist_exclusive_access',
    'plan_upgraded',
    'plan_downgrade_scheduled',
    'plan_cancellation_scheduled',
    'plan_reactivated'
  )
);

-- Update RLS policy to allow plan_reactivated alerts
DROP POLICY IF EXISTS "System can create alerts" ON public.alerts;

CREATE POLICY "System can create alerts"
ON public.alerts
FOR INSERT
WITH CHECK (
  alert_type = ANY (
    ARRAY[
      'client_shortlisted',
      'coach_selection_request',
      'coach_selection_sent',
      'coach_update',
      'discovery_call_booked',
      'discovery_call_cancelled',
      'document_submission',
      'profile_published',
      'verification_update',
      'waitlist_exclusive_access',
      'plan_upgraded',
      'plan_downgrade_scheduled',
      'plan_cancellation_scheduled',
      'plan_reactivated'
    ]
  )
);