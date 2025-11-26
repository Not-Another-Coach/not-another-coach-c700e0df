-- Fix trainer_uploaded_images RLS to require authentication
-- Currently selected images are publicly readable, exposing personal photos to anyone

-- Drop the overly permissive public viewing policy
DROP POLICY IF EXISTS "Anyone can view selected uploaded images" ON public.trainer_uploaded_images;

-- The existing authenticated policies are already secure:
-- 1. "Authorized clients can view trainer images" - requires authentication and engagement
-- 2. "secure_manage_trainer_images_2025" - trainers manage their own

-- Add comment explaining security
COMMENT ON TABLE public.trainer_uploaded_images IS 'Trainer personal photos - restricted to authenticated users with proper engagement relationships to protect against harassment and unauthorized use';