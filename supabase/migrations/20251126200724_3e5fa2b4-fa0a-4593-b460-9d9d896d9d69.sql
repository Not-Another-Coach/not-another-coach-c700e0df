-- Allow public read access to app logo settings for non-authenticated users
-- This is secure because:
-- 1. It's read-only (SELECT only)
-- 2. It only exposes the app_logo setting (public branding information)
-- 3. All other settings remain protected by existing RLS policies

CREATE POLICY "Allow public read of app logo settings"
ON app_settings
FOR SELECT
TO public
USING (setting_key = 'app_logo');