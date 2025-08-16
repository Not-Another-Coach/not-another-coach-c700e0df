-- Enable template_assigned alert type in RLS policies
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "System can create alerts" ON public.alerts;
  
  -- Recreate with template_assigned included
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
        'verification_update'::text, 
        'task_overdue'::text, 
        'sla_breached'::text,
        'template_assigned'::text
      ])
    );
END $$;