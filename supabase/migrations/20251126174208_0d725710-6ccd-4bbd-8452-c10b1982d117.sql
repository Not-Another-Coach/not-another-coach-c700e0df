-- Allow authenticated users to read app settings (logo, branding, etc.)
-- This enables all users to see the app logo and branding while keeping modification admin-only
CREATE POLICY "Allow authenticated users to read app settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);