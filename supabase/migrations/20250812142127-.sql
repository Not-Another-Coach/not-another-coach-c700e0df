-- Remove overly permissive profiles policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;