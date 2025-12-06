-- =============================================================================
-- DEV ENVIRONMENT URL MIGRATION SCRIPT
-- =============================================================================
-- 
-- ⚠️  WARNING: This script is for DEVELOPMENT environment ONLY!
-- ⛔  NEVER run this on production!
--
-- Purpose: Updates storage URLs from production Supabase project to development
--          project after copying data from prod to dev.
--
-- Production Project ID: ogpiovfxjxcclptfybrk
-- Development Project ID: zkzahqnsfjnvskfywbvg
--
-- Run this ONLY on: DEV Supabase SQL Editor
-- =============================================================================

-- Verify you're on the right database before proceeding!
-- Check that this returns the DEV project info:
SELECT current_database(), current_user;

-- =============================================================================
-- 1. Update app_settings (app logo)
-- =============================================================================
UPDATE app_settings 
SET setting_value = jsonb_set(
  setting_value::jsonb, 
  '{logo_url}', 
  to_jsonb(REPLACE(setting_value::jsonb->>'logo_url', 'ogpiovfxjxcclptfybrk', 'zkzahqnsfjnvskfywbvg'))
)
WHERE setting_key = 'app_logo' 
  AND setting_value::jsonb->>'logo_url' LIKE '%ogpiovfxjxcclptfybrk%';

-- =============================================================================
-- 2. Update profile photos
-- =============================================================================
UPDATE profiles 
SET profile_photo_url = REPLACE(profile_photo_url, 'ogpiovfxjxcclptfybrk', 'zkzahqnsfjnvskfywbvg')
WHERE profile_photo_url LIKE '%ogpiovfxjxcclptfybrk%';

-- =============================================================================
-- 3. Update trainer testimonials (JSONB field with nested image URLs)
-- =============================================================================
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

-- =============================================================================
-- 4. Update uploaded certificates (JSONB field with file URLs)
-- =============================================================================
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

-- =============================================================================
-- Verification: Check for any remaining production URLs
-- =============================================================================
SELECT 'app_settings' as table_name, COUNT(*) as remaining_prod_urls
FROM app_settings 
WHERE setting_value::text LIKE '%ogpiovfxjxcclptfybrk%'
UNION ALL
SELECT 'profiles', COUNT(*) 
FROM profiles 
WHERE profile_photo_url LIKE '%ogpiovfxjxcclptfybrk%'
UNION ALL
SELECT 'trainer_profiles_testimonials', COUNT(*) 
FROM trainer_profiles 
WHERE testimonials::text LIKE '%ogpiovfxjxcclptfybrk%'
UNION ALL
SELECT 'trainer_profiles_certificates', COUNT(*) 
FROM trainer_profiles 
WHERE uploaded_certificates::text LIKE '%ogpiovfxjxcclptfybrk%';
