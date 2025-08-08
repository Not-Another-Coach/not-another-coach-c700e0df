-- One-time migration: Import activities from package_ways_of_working into trainer_onboarding_activities
-- This migration deduplicates per (trainer_id, activity_name, category)
-- and skips blank/null texts.

-- Onboarding
INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
SELECT pw.trainer_id,
       trim(both from item->>'text') AS activity_name,
       'Onboarding' AS category
FROM public.package_ways_of_working pw
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(pw.onboarding_items, '[]'::jsonb)) AS item
WHERE trim(both from item->>'text') IS NOT NULL
  AND trim(both from item->>'text') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.trainer_onboarding_activities toa
    WHERE toa.trainer_id = pw.trainer_id
      AND toa.activity_name = trim(both from item->>'text')
      AND toa.category = 'Onboarding'
  );

-- First Week
INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
SELECT pw.trainer_id,
       trim(both from item->>'text') AS activity_name,
       'First Week' AS category
FROM public.package_ways_of_working pw
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(pw.first_week_items, '[]'::jsonb)) AS item
WHERE trim(both from item->>'text') IS NOT NULL
  AND trim(both from item->>'text') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.trainer_onboarding_activities toa
    WHERE toa.trainer_id = pw.trainer_id
      AND toa.activity_name = trim(both from item->>'text')
      AND toa.category = 'First Week'
  );

-- Ongoing Structure
INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
SELECT pw.trainer_id,
       trim(both from item->>'text') AS activity_name,
       'Ongoing Structure' AS category
FROM public.package_ways_of_working pw
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(pw.ongoing_structure_items, '[]'::jsonb)) AS item
WHERE trim(both from item->>'text') IS NOT NULL
  AND trim(both from item->>'text') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.trainer_onboarding_activities toa
    WHERE toa.trainer_id = pw.trainer_id
      AND toa.activity_name = trim(both from item->>'text')
      AND toa.category = 'Ongoing Structure'
  );

-- Tracking Tools
INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
SELECT pw.trainer_id,
       trim(both from item->>'text') AS activity_name,
       'Tracking Tools' AS category
FROM public.package_ways_of_working pw
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(pw.tracking_tools_items, '[]'::jsonb)) AS item
WHERE trim(both from item->>'text') IS NOT NULL
  AND trim(both from item->>'text') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.trainer_onboarding_activities toa
    WHERE toa.trainer_id = pw.trainer_id
      AND toa.activity_name = trim(both from item->>'text')
      AND toa.category = 'Tracking Tools'
  );

-- Client Expectations
INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
SELECT pw.trainer_id,
       trim(both from item->>'text') AS activity_name,
       'Client Expectations' AS category
FROM public.package_ways_of_working pw
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(pw.client_expectations_items, '[]'::jsonb)) AS item
WHERE trim(both from item->>'text') IS NOT NULL
  AND trim(both from item->>'text') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.trainer_onboarding_activities toa
    WHERE toa.trainer_id = pw.trainer_id
      AND toa.activity_name = trim(both from item->>'text')
      AND toa.category = 'Client Expectations'
  );

-- What I Bring
INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
SELECT pw.trainer_id,
       trim(both from item->>'text') AS activity_name,
       'What I Bring' AS category
FROM public.package_ways_of_working pw
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(pw.what_i_bring_items, '[]'::jsonb)) AS item
WHERE trim(both from item->>'text') IS NOT NULL
  AND trim(both from item->>'text') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.trainer_onboarding_activities toa
    WHERE toa.trainer_id = pw.trainer_id
      AND toa.activity_name = trim(both from item->>'text')
      AND toa.category = 'What I Bring'
  );