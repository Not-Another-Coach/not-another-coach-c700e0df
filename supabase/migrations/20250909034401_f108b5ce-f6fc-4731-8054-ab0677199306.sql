-- Fix Security Definer View issue by recreating views with proper security controls

-- Drop existing potentially insecure views
DROP VIEW IF EXISTS public.v_clients CASCADE;
DROP VIEW IF EXISTS public.v_trainers CASCADE;

-- Recreate v_clients view with proper security (SECURITY INVOKER is default and secure)
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
  p.created_at,
  p.updated_at,
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
  cp.fitness_equipment_access,
  cp.lifestyle_description,
  cp.lifestyle_other,
  cp.health_conditions,
  cp.has_specific_event,
  cp.specific_event_details,
  cp.specific_event_date
FROM profiles p
LEFT JOIN client_profiles cp ON p.id = cp.id
WHERE p.user_type = 'client';

-- Recreate v_trainers view with proper security (SECURITY INVOKER is default and secure)
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
  p.profile_image_position,
  p.wow_how_i_work,
  p.wow_what_i_provide,
  p.wow_client_expectations,
  p.wow_activities,
  p.wow_activity_assignments,
  p.wow_visibility,
  p.wow_setup_completed,
  p.terms_agreed,
  p.accuracy_confirmed,
  p.notify_profile_views,
  p.notify_messages,
  p.notify_insights,
  tp.hourly_rate,
  tp.free_discovery_call,
  tp.calendar_link,
  tp.profile_setup_completed,
  tp.max_clients,
  tp.qualifications,
  tp.specializations,
  tp.training_types,
  tp.delivery_format,
  tp.ideal_client_types,
  tp.coaching_style,
  tp.communication_style,
  tp.ideal_client_personality,
  tp.package_options,
  tp.video_checkins,
  tp.messaging_support,
  tp.weekly_programming_only,
  tp.ways_of_working_onboarding,
  tp.ways_of_working_first_week,
  tp.ways_of_working_ongoing,
  tp.ways_of_working_tracking,
  tp.ways_of_working_expectations,
  tp.ways_of_working_what_i_bring,
  tp.how_started,
  tp.philosophy,
  tp.professional_milestones,
  tp.uploaded_certificates,
  tp.testimonials,
  tp.verification_status,
  tp.verification_documents,
  tp.admin_verification_notes,
  tp.admin_review_notes,
  tp.is_verified,
  tp.verification_requested_at,
  tp.rating,
  tp.total_ratings,
  tp.certifying_body,
  tp.year_certified,
  tp.availability_schedule,
  tp.works_bank_holidays
FROM profiles p
LEFT JOIN trainer_profiles tp ON p.id = tp.id
WHERE p.user_type = 'trainer';

-- Enable RLS on the views (inherited from underlying tables)
ALTER VIEW public.v_clients SET (security_barrier = true);
ALTER VIEW public.v_trainers SET (security_barrier = true);

-- Grant appropriate permissions to ensure existing functionality continues to work
GRANT SELECT ON public.v_clients TO anon, authenticated, service_role;
GRANT SELECT ON public.v_trainers TO anon, authenticated, service_role;

-- Add comments to document the security measures
COMMENT ON VIEW public.v_clients IS 'Secure view of client profiles that respects RLS policies from underlying tables';
COMMENT ON VIEW public.v_trainers IS 'Secure view of trainer profiles that respects RLS policies from underlying tables';