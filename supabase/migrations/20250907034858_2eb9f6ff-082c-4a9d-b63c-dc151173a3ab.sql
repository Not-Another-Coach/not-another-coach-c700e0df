-- Temporary debugging policy for profiles table
-- This will help identify if the RLS policy is causing the login issue

DROP POLICY IF EXISTS "secure_view_profiles_2025" ON public.profiles;

-- Create a more permissive temporary policy for debugging
CREATE POLICY "debug_profiles_access_2025"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Also ensure authenticated users can read their own profile data
CREATE POLICY "debug_profiles_own_access_2025"
ON public.profiles FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());