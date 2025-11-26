-- Fix app_settings RLS to prevent public exposure of system configuration
-- Remove the public read policy that exposes system configuration
DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;

-- Keep the admin management policy (already exists: "Admins can manage app settings")
-- This allows admins to read, update, insert, and delete settings

-- Add comment documenting the security model
COMMENT ON TABLE public.app_settings IS 
'Security model: Only authenticated administrators can view and manage system settings. 
Contains sensitive platform configuration including logo URLs, payment schedules, and access control settings.';