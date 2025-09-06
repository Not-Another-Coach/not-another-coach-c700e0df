-- Comprehensive Client Profile Architecture Fix - Fixed Version
-- Step 1: Add missing lifestyle fields to client_profiles table if they don't exist

ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS fitness_equipment_access JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_description JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_other TEXT,
ADD COLUMN IF NOT EXISTS health_conditions TEXT,
ADD COLUMN IF NOT EXISTS has_specific_event TEXT,
ADD COLUMN IF NOT EXISTS specific_event_details TEXT,
ADD COLUMN IF NOT EXISTS specific_event_date DATE;

-- Step 2: Migrate existing data for client-specific columns that actually exist in profiles
DO $$
DECLARE
  rec RECORD;
BEGIN
  -- For each client, create or update their client_profiles record with data from profiles
  FOR rec IN SELECT id FROM public.profiles WHERE user_type = 'client' LOOP
    INSERT INTO public.client_profiles (
      id, 
      primary_goals, fitness_goals, experience_level, 
      preferred_training_frequency, preferred_time_slots, start_timeline,
      preferred_coaching_style, motivation_factors, client_personality_type,
      training_location_preference, open_to_virtual_coaching, budget_range_min,
      budget_range_max, budget_flexibility, waitlist_preference, flexible_scheduling,
      preferred_package_type, quiz_completed, quiz_answers, quiz_completed_at,
      client_survey_completed, client_survey_completed_at, client_status,
      client_journey_stage, journey_progress, fitness_equipment_access,
      lifestyle_description, lifestyle_other, health_conditions, has_specific_event,
      specific_event_details, specific_event_date
    )
    SELECT 
      p.id,
      p.primary_goals, p.fitness_goals, p.experience_level,
      p.preferred_training_frequency, p.preferred_time_slots, p.start_timeline,
      p.preferred_coaching_style, p.motivation_factors, p.client_personality_type,
      p.training_location_preference, p.open_to_virtual_coaching, p.budget_range_min,
      p.budget_range_max, p.budget_flexibility, p.waitlist_preference, p.flexible_scheduling,
      p.preferred_package_type, p.quiz_completed, p.quiz_answers, p.quiz_completed_at,
      p.client_survey_completed, p.client_survey_completed_at, p.client_status,
      p.client_journey_stage, p.journey_progress, p.fitness_equipment_access,
      p.lifestyle_description, p.lifestyle_other, p.health_conditions, p.has_specific_event,
      p.specific_event_details, p.specific_event_date
    FROM public.profiles p
    WHERE p.id = rec.id
    ON CONFLICT (id) DO UPDATE SET
      primary_goals = EXCLUDED.primary_goals,
      fitness_goals = EXCLUDED.fitness_goals,
      experience_level = EXCLUDED.experience_level,
      preferred_training_frequency = EXCLUDED.preferred_training_frequency,
      preferred_time_slots = EXCLUDED.preferred_time_slots,
      start_timeline = EXCLUDED.start_timeline,
      preferred_coaching_style = EXCLUDED.preferred_coaching_style,
      motivation_factors = EXCLUDED.motivation_factors,
      client_personality_type = EXCLUDED.client_personality_type,
      training_location_preference = EXCLUDED.training_location_preference,
      open_to_virtual_coaching = EXCLUDED.open_to_virtual_coaching,
      budget_range_min = EXCLUDED.budget_range_min,
      budget_range_max = EXCLUDED.budget_range_max,
      budget_flexibility = EXCLUDED.budget_flexibility,
      waitlist_preference = EXCLUDED.waitlist_preference,
      flexible_scheduling = EXCLUDED.flexible_scheduling,
      preferred_package_type = EXCLUDED.preferred_package_type,
      quiz_completed = EXCLUDED.quiz_completed,
      quiz_answers = EXCLUDED.quiz_answers,
      quiz_completed_at = EXCLUDED.quiz_completed_at,
      client_survey_completed = EXCLUDED.client_survey_completed,
      client_survey_completed_at = EXCLUDED.client_survey_completed_at,
      client_status = EXCLUDED.client_status,
      client_journey_stage = EXCLUDED.client_journey_stage,
      journey_progress = EXCLUDED.journey_progress,
      fitness_equipment_access = EXCLUDED.fitness_equipment_access,
      lifestyle_description = EXCLUDED.lifestyle_description,
      lifestyle_other = EXCLUDED.lifestyle_other,
      health_conditions = EXCLUDED.health_conditions,
      has_specific_event = EXCLUDED.has_specific_event,
      specific_event_details = EXCLUDED.specific_event_details,
      specific_event_date = EXCLUDED.specific_event_date,
      updated_at = now();
  END LOOP;
END $$;

-- Step 3: Remove client-specific columns from profiles table (only those that exist)
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS primary_goals,
DROP COLUMN IF EXISTS fitness_goals,
DROP COLUMN IF EXISTS experience_level,
DROP COLUMN IF EXISTS preferred_training_frequency,
DROP COLUMN IF EXISTS preferred_time_slots,
DROP COLUMN IF EXISTS start_timeline,
DROP COLUMN IF EXISTS preferred_coaching_style,
DROP COLUMN IF EXISTS motivation_factors,
DROP COLUMN IF EXISTS client_personality_type,
DROP COLUMN IF EXISTS training_location_preference,
DROP COLUMN IF EXISTS open_to_virtual_coaching,
DROP COLUMN IF EXISTS budget_range_min,
DROP COLUMN IF EXISTS budget_range_max,
DROP COLUMN IF EXISTS budget_flexibility,
DROP COLUMN IF EXISTS waitlist_preference,
DROP COLUMN IF EXISTS flexible_scheduling,
DROP COLUMN IF EXISTS preferred_package_type,
DROP COLUMN IF EXISTS quiz_completed,
DROP COLUMN IF EXISTS quiz_answers,
DROP COLUMN IF EXISTS quiz_completed_at,
DROP COLUMN IF EXISTS client_survey_completed,
DROP COLUMN IF EXISTS client_survey_completed_at,
DROP COLUMN IF EXISTS client_status,
DROP COLUMN IF EXISTS client_journey_stage,
DROP COLUMN IF EXISTS journey_progress,
DROP COLUMN IF EXISTS fitness_equipment_access,
DROP COLUMN IF EXISTS lifestyle_description,
DROP COLUMN IF EXISTS lifestyle_other,
DROP COLUMN IF EXISTS health_conditions,
DROP COLUMN IF EXISTS has_specific_event,
DROP COLUMN IF EXISTS specific_event_details,
DROP COLUMN IF EXISTS specific_event_date;