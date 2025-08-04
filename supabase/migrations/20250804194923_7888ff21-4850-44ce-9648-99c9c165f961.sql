-- Update RLS policies for alerts table to support discovery call alerts

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Coaches can create their own updates" ON public.alerts;
DROP POLICY IF EXISTS "Users can view active alerts" ON public.alerts;

-- Create new policies that support discovery call alerts
CREATE POLICY "Trainers can create discovery call alerts" 
ON public.alerts 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND 
  alert_type IN ('discovery_call_booked', 'discovery_call_cancelled', 'discovery_call_rescheduled', 'coach_update') AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.user_type = 'trainer'
  )
);

-- Allow system/any user to create discovery call alerts (for when clients trigger them)
CREATE POLICY "System can create discovery call alerts"
ON public.alerts
FOR INSERT
WITH CHECK (
  alert_type IN ('discovery_call_booked', 'discovery_call_cancelled', 'discovery_call_rescheduled')
);

-- Updated view policy to include trainers viewing their alerts
CREATE POLICY "Users can view relevant active alerts" 
ON public.alerts 
FOR SELECT 
USING (
  is_active = true AND 
  (expires_at IS NULL OR expires_at > now()) AND
  (
    -- Empty target audience = everyone can see
    target_audience = '{}'::jsonb OR
    -- Specific "all" audience
    target_audience ? 'all' OR
    -- Clients can see client-targeted alerts
    (target_audience ? 'clients' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'client'
    )) OR
    -- Trainers can see trainer-targeted alerts AND alerts created for them
    (target_audience ? 'trainers' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'trainer'
    )) OR
    -- Users can see alerts created for them specifically
    created_by = auth.uid()
  )
);