-- Fix the v_clients view and clean up architecture
-- Step 1: Drop and recreate v_clients view to properly join profiles and client_profiles
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
  
  -- Lifestyle and health fields (from client_profiles)
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

-- Step 2: Add missing lifestyle fields to client_profiles table if they don't exist
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS fitness_equipment_access JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_description JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_other TEXT,
ADD COLUMN IF NOT EXISTS health_conditions TEXT,
ADD COLUMN IF NOT EXISTS has_specific_event TEXT,
ADD COLUMN IF NOT EXISTS specific_event_details TEXT,
ADD COLUMN IF NOT EXISTS specific_event_date DATE;

-- Step 3: Remove lifestyle fields from profiles table now that view is fixed
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS fitness_equipment_access,
DROP COLUMN IF EXISTS lifestyle_description,
DROP COLUMN IF EXISTS lifestyle_other,
DROP COLUMN IF EXISTS health_conditions,
DROP COLUMN IF EXISTS has_specific_event,
DROP COLUMN IF EXISTS specific_event_details,
DROP COLUMN IF EXISTS specific_event_date;