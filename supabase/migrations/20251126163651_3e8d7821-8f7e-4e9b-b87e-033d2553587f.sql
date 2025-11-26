
-- Update platform access control to enable client access
UPDATE app_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{client_access_enabled}',
  'true'::jsonb
)
WHERE setting_key = 'platform_access_control';

-- If the setting doesn't exist, create it
INSERT INTO app_settings (setting_key, setting_value)
VALUES ('platform_access_control', '{"client_access_enabled": true, "trainer_access_enabled": true}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;
