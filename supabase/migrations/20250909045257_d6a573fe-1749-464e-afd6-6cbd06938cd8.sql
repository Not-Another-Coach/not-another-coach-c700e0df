-- Fix the corrupted app_logo setting by properly formatting it as JSON
UPDATE app_settings 
SET setting_value = jsonb_build_object(
  'app_name', 'Not Another Coach',
  'fallback_text', 'NA', 
  'logo_url', 'https://ogpiovfxjxcclptfybrk.supabase.co/storage/v1/object/public/logos/app-logo-1757393474952.jpg'
)
WHERE setting_key = 'app_logo';