-- Fix package_ways_of_working RLS to restrict access to authenticated users only
-- Currently public packages are readable by anyone, exposing pricing to competitors

-- Drop the overly permissive public viewing policy
DROP POLICY IF EXISTS "Public can view public package ways of working" ON public.package_ways_of_working;

-- Create new policy requiring authentication and proper engagement
CREATE POLICY "Authenticated users can view engaged trainer packages"
  ON public.package_ways_of_working
  FOR SELECT
  TO authenticated
  USING (
    -- Trainers can always see their own
    auth.uid() = trainer_id
    OR
    -- Clients can view packages from trainers they've engaged with
    (EXISTS (
      SELECT 1
      FROM client_trainer_engagement e
      WHERE e.client_id = auth.uid()
        AND e.trainer_id = package_ways_of_working.trainer_id
        AND e.stage IN ('matched', 'discovery_completed', 'agreed', 'payment_pending', 'active_client')
    ))
  );

-- Update the existing post-match policy to remove redundancy
DROP POLICY IF EXISTS "Clients can view post-match package ways of working" ON public.package_ways_of_working;

-- Add comment explaining security
COMMENT ON TABLE public.package_ways_of_working IS 'Package pricing and service details - restricted to authenticated users with proper trainer engagement to protect business strategy';