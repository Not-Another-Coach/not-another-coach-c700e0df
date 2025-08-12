-- Tighten access: coach_availability_settings should not be publicly readable
DROP POLICY IF EXISTS "Users can view coach availability" ON public.coach_availability_settings;

-- Clients with engagement can view a coach's availability
CREATE POLICY "Availability: engaged clients can view"
ON public.coach_availability_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_trainer_engagement e
    WHERE e.client_id = auth.uid()
      AND e.trainer_id = coach_availability_settings.coach_id
  )
);

-- Clients on the coach's active waitlist can view availability
CREATE POLICY "Availability: waitlisted clients can view"
ON public.coach_availability_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coach_waitlists cw
    WHERE cw.client_id = auth.uid()
      AND cw.coach_id = coach_availability_settings.coach_id
      AND cw.status = 'active'
  )
);
