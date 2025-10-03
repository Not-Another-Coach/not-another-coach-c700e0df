-- Fix alerts RLS policies to properly filter by target audience
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view relevant active alerts" ON alerts;
DROP POLICY IF EXISTS "optimized_users_can_view_alerts" ON alerts;

-- Create new policy that uses the updated user_in_target_audience function
CREATE POLICY "Users can view their targeted alerts"
ON alerts
FOR SELECT
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
  AND user_in_target_audience(target_audience)
);

-- Keep other policies intact (for creating alerts)
-- The system and trainers can still create alerts as before