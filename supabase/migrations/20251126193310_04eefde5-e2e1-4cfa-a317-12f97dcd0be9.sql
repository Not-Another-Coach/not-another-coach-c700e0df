-- Fix webhook_events RLS policy security issue
-- Remove overly permissive policy that allows any authenticated user to manage webhook events

-- Drop the insecure "System can manage webhook events" policy
DROP POLICY IF EXISTS "System can manage webhook events" ON public.webhook_events;

-- The existing "Admins can view webhook events" policy remains:
-- CREATE POLICY "Admins can view webhook events" ON public.webhook_events FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Note: Edge functions using SUPABASE_SERVICE_ROLE_KEY bypass RLS automatically,
-- so no additional policy is needed for webhook processing.
-- Only admins can view webhook events for debugging/monitoring purposes.