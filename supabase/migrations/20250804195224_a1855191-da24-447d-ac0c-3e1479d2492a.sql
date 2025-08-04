-- Update RLS policy to handle both object and array formats for target_audience
DROP POLICY IF EXISTS "Users can view relevant active alerts" ON public.alerts;

CREATE POLICY "Users can view relevant active alerts" 
ON public.alerts 
FOR SELECT 
USING (
  is_active = true AND 
  (expires_at IS NULL OR expires_at > now()) AND
  (
    -- Empty target audience = everyone can see
    target_audience IS NULL OR
    target_audience = '[]'::jsonb OR
    target_audience = '{}'::jsonb OR
    -- Specific "all" audience (array or object format)
    target_audience ? 'all' OR
    target_audience @> '["all"]'::jsonb OR
    -- Clients can see client-targeted alerts (array or object format)
    ((target_audience ? 'clients' OR target_audience @> '["clients"]'::jsonb) AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'client'
    )) OR
    -- Trainers can see trainer-targeted alerts (array or object format)
    ((target_audience ? 'trainers' OR target_audience @> '["trainers"]'::jsonb) AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'trainer'
    )) OR
    -- Users can see alerts created for them specifically
    created_by = auth.uid()
  )
);