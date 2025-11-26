-- CRITICAL SECURITY FIX: Remove debug policy exposing all user data to public
-- This policy allows anyone on the internet to read sensitive user information
DROP POLICY IF EXISTS "debug_profiles_access_2025" ON public.profiles;

-- Verify remaining policies are sufficient for legitimate access:
-- 1. "Users can view and update their own profile" - users access their own data
-- 2. "Admins can view all profiles" - admin management
-- 3. "Trainers can view their clients' profiles" - proper trainer-client relationship
-- 4. "Clients can view engaged trainers' profiles" - proper client-trainer relationship

-- Add security comment
COMMENT ON TABLE public.profiles IS 
'Security model: Users can only view their own profile. Admins can view all profiles. 
Trainers and clients can view each other through proper engagement relationships only. 
NO public access to protect sensitive PII (names, emails, phones, addresses, payment details).';