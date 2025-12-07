-- Migration: Replace production Supabase URLs with dev URLs
-- This updates all database records that reference the prod storage bucket

-- Update app_settings (app logo)
UPDATE app_settings 
SET setting_value = jsonb_set(
  setting_value::jsonb, 
  '{logo_url}', 
  to_jsonb(REPLACE(setting_value::jsonb->>'logo_url', 'ogpiovfxjxcclptfybrk', 'zkzahqnsfjnvskfywbvg'))
)
WHERE setting_key = 'app_logo' 
  AND setting_value::jsonb->>'logo_url' LIKE '%ogpiovfxjxcclptfybrk%';

-- Update profile photos
UPDATE profiles 
SET profile_photo_url = REPLACE(profile_photo_url, 'ogpiovfxjxcclptfybrk', 'zkzahqnsfjnvskfywbvg')
WHERE profile_photo_url LIKE '%ogpiovfxjxcclptfybrk%';

-- Update trainer testimonials (JSONB field with nested image URLs)
UPDATE trainer_profiles 
SET testimonials = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem ? 'beforeImageUrl' OR elem ? 'afterImageUrl' THEN
        jsonb_set(
          jsonb_set(
            elem,
            '{beforeImageUrl}',
            to_jsonb(REPLACE(COALESCE(elem->>'beforeImageUrl', ''), 'ogpiovfxjxcclptfybrk', 'zkzahqnsfjnvskfywbvg'))
          ),
          '{afterImageUrl}',
          to_jsonb(REPLACE(COALESCE(elem->>'afterImageUrl', ''), 'ogpiovfxjxcclptfybrk', 'zkzahqnsfjnvskfywbvg'))
        )
      ELSE elem
    END
  )
  FROM jsonb_array_elements(testimonials) elem
)
WHERE testimonials::text LIKE '%ogpiovfxjxcclptfybrk%';

-- Update uploaded certificates (JSONB field with file URLs)
UPDATE trainer_profiles 
SET uploaded_certificates = (
  SELECT jsonb_agg(
    jsonb_set(
      elem,
      '{file_url}',
      to_jsonb(REPLACE(COALESCE(elem->>'file_url', ''), 'ogpiovfxjxcclptfybrk', 'zkzahqnsfjnvskfywbvg'))
    )
  )
  FROM jsonb_array_elements(uploaded_certificates) elem
)
WHERE uploaded_certificates::text LIKE '%ogpiovfxjxcclptfybrk%';