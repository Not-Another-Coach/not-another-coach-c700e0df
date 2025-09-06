-- Step 1: Add missing lifestyle fields to client_profiles table first
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS fitness_equipment_access JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_description JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_other TEXT,
ADD COLUMN IF NOT EXISTS health_conditions TEXT,
ADD COLUMN IF NOT EXISTS has_specific_event TEXT,
ADD COLUMN IF NOT EXISTS specific_event_details TEXT,
ADD COLUMN IF NOT EXISTS specific_event_date DATE;

-- Step 2: Migrate data from profiles to client_profiles for the lifestyle fields
UPDATE public.client_profiles 
SET 
  fitness_equipment_access = p.fitness_equipment_access,
  lifestyle_description = p.lifestyle_description,
  lifestyle_other = p.lifestyle_other,
  health_conditions = p.health_conditions,
  has_specific_event = p.has_specific_event,
  specific_event_details = p.specific_event_details,
  specific_event_date = p.specific_event_date,
  updated_at = now()
FROM public.profiles p
WHERE client_profiles.id = p.id 
  AND p.user_type = 'client'
  AND (p.fitness_equipment_access IS NOT NULL 
    OR p.lifestyle_description IS NOT NULL 
    OR p.lifestyle_other IS NOT NULL
    OR p.health_conditions IS NOT NULL
    OR p.has_specific_event IS NOT NULL
    OR p.specific_event_details IS NOT NULL
    OR p.specific_event_date IS NOT NULL);

-- Step 3: Update the v_clients view to use client_profiles for lifestyle fields
DROP VIEW IF EXISTS public.v_clients;

CREATE VIEW public.v_clients AS
SELECT 
  -- From profiles (shared fields)
  p.id,
  p.user_type,
  p.first_name,
  p.last_name,
  p.bio,
  p.profile_photo_url,
  p.location,
  p.tagline,
  p.is_uk_based,
  p.profile_published,
  p.created_at,
  p.updated_at,
  
  -- From client_profiles (client-specific fields)
  cp.primary_goals,
  cp.secondary_goals,
  cp.fitness_goals,
  cp.experience_level,
  cp.preferred_training_frequency,
  cp.preferred_time_slots,
  cp.start_timeline,
  cp.preferred_coaching_style,
  cp.motivation_factors,
  cp.client_personality_type,
  cp.training_location_preference,
  cp.open_to_virtual_coaching,
  cp.budget_range_min,
  cp.budget_range_max,
  cp.budget_flexibility,
  cp.waitlist_preference,
  cp.flexible_scheduling,
  cp.preferred_package_type,
  cp.quiz_completed,
  cp.quiz_answers,
  cp.quiz_completed_at,
  cp.client_survey_completed,
  cp.client_survey_completed_at,
  cp.client_status,
  cp.client_journey_stage,
  cp.journey_progress,
  
  -- Lifestyle and health fields (from client_profiles now)
  cp.fitness_equipment_access,
  cp.lifestyle_description,
  cp.lifestyle_other,
  cp.health_conditions,
  cp.has_specific_event,
  cp.specific_event_details,
  cp.specific_event_date
  
FROM public.profiles p
LEFT JOIN public.client_profiles cp ON p.id = cp.id
WHERE p.user_type = 'client';

-- Step 4: Now we can safely remove the lifestyle fields from profiles
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS fitness_equipment_access,
DROP COLUMN IF EXISTS lifestyle_description,
DROP COLUMN IF EXISTS lifestyle_other,
DROP COLUMN IF EXISTS health_conditions,
DROP COLUMN IF EXISTS has_specific_event,
DROP COLUMN IF EXISTS specific_event_details,
DROP COLUMN IF EXISTS specific_event_date;