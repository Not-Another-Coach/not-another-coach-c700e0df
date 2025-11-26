-- Fix trainer_uploaded_images RLS policies to prevent public exposure of private images
-- Remove problematic policy that grants public ALL access
DROP POLICY IF EXISTS "Trainers can manage their own uploaded images" ON public.trainer_uploaded_images;

-- Remove duplicate/redundant policies
DROP POLICY IF EXISTS "Trainers can manage their own images" ON public.trainer_uploaded_images;

-- Keep the secure 2025 policy for trainers to manage their own images (authenticated only)
-- This already exists: secure_manage_trainer_images_2025

-- Ensure public can ONLY view images explicitly selected for display
-- This policy already exists and is correct: "Anyone can view selected uploaded images"

-- Ensure authorized clients can view trainer images through proper engagement
-- This policy already exists: "Authorized clients can view trainer images"

-- Add comment to document the security model
COMMENT ON TABLE public.trainer_uploaded_images IS 
'Security model: Public can only view images where is_selected_for_display=true. 
Trainers can manage all their own images (authenticated). 
Clients can view trainer images only through proper engagement relationship.';