-- Fix membership_plan_definitions RLS to restrict to authenticated users only
-- Currently the table is publicly readable, exposing pricing strategy to competitors

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view active plans" ON public.membership_plan_definitions;

-- Create new policy that actually requires authentication
CREATE POLICY "Authenticated users can view active plans"
  ON public.membership_plan_definitions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Add comment explaining security
COMMENT ON TABLE public.membership_plan_definitions IS 'Membership plan pricing - restricted to authenticated users to protect pricing strategy';