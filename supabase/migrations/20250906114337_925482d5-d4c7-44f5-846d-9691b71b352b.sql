-- Add new lifestyle and health fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS fitness_equipment_access JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_description JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_other TEXT,
ADD COLUMN IF NOT EXISTS health_conditions TEXT,
ADD COLUMN IF NOT EXISTS has_specific_event TEXT,
ADD COLUMN IF NOT EXISTS specific_event_details TEXT,
ADD COLUMN IF NOT EXISTS specific_event_date DATE;

-- Drop and recreate the v_clients view with new fields
DROP VIEW IF EXISTS public.v_clients;

CREATE VIEW public.v_clients AS
SELECT 
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
    p.created_at AS profile_created_at,
    p.updated_at AS profile_updated_at,
    
    -- New lifestyle and health fields from profiles
    p.fitness_equipment_access,
    p.lifestyle_description,
    p.lifestyle_other,
    p.health_conditions,
    p.has_specific_event,
    p.specific_event_details,
    p.specific_event_date,
    
    -- Client profile fields
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
    cp.created_at AS client_profile_created_at,
    cp.updated_at AS client_profile_updated_at
FROM public.profiles p
LEFT JOIN public.client_profiles cp ON p.id = cp.id
WHERE p.user_type = 'client';