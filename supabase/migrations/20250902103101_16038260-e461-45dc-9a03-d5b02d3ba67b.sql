-- Fix security issues from previous migration

-- Drop and recreate views without security definer
DROP VIEW IF EXISTS public.v_trainers;
DROP VIEW IF EXISTS public.v_clients;

-- Create views without security definer (these are regular views, not security definer)
CREATE VIEW public.v_trainers AS
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
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at,
  
  -- Trainer-specific fields
  tp.specializations,
  tp.qualifications,
  tp.certifying_body,
  tp.year_certified,
  tp.uploaded_certificates,
  tp.hourly_rate,
  tp.package_options,
  tp.availability_schedule,
  tp.max_clients,
  tp.works_bank_holidays,
  tp.verification_status,
  tp.verification_requested_at,
  tp.verification_documents,
  tp.admin_verification_notes,
  tp.admin_review_notes,
  tp.is_verified,
  tp.rating,
  tp.total_ratings,
  tp.free_discovery_call,
  tp.offers_discovery_call,
  tp.discovery_call_price,
  tp.calendar_link,
  tp.testimonials,
  tp.training_types,
  tp.delivery_format,
  tp.communication_style,
  tp.video_checkins,
  tp.messaging_support,
  tp.weekly_programming_only,
  tp.ways_of_working_onboarding,
  tp.ways_of_working_first_week,
  tp.ways_of_working_ongoing,
  tp.ways_of_working_tracking,
  tp.ways_of_working_expectations,
  tp.ways_of_working_what_i_bring,
  tp.profile_setup_completed,
  tp.terms_agreed,
  tp.created_at as trainer_profile_created_at,
  tp.updated_at as trainer_profile_updated_at
FROM public.profiles p
JOIN public.trainer_profiles tp ON p.id = tp.id
WHERE p.user_type = 'trainer';

-- Create view for clients
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
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at,
  
  -- Client-specific fields
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
  cp.created_at as client_profile_created_at,
  cp.updated_at as client_profile_updated_at
FROM public.profiles p
JOIN public.client_profiles cp ON p.id = cp.id
WHERE p.user_type = 'client';

-- Fix functions to include SET search_path
DROP FUNCTION IF EXISTS update_trainer_profile_updated_at();
DROP FUNCTION IF EXISTS update_client_profile_updated_at();
DROP FUNCTION IF EXISTS create_domain_profile();

CREATE OR REPLACE FUNCTION update_trainer_profile_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_client_profile_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_domain_profile()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_type = 'trainer' THEN
    INSERT INTO public.trainer_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  ELSIF NEW.user_type = 'client' THEN
    INSERT INTO public.client_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS update_trainer_profiles_updated_at ON public.trainer_profiles;
DROP TRIGGER IF EXISTS update_client_profiles_updated_at ON public.client_profiles;
DROP TRIGGER IF EXISTS create_domain_profile_on_insert ON public.profiles;

CREATE TRIGGER update_trainer_profiles_updated_at
  BEFORE UPDATE ON public.trainer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_trainer_profile_updated_at();

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_client_profile_updated_at();

CREATE TRIGGER create_domain_profile_on_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_domain_profile();