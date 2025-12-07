-- Add preferred_client_genders column to trainer_profiles and update v_trainers view
-- to include both gender and preferred_client_genders

-- Step 1: Add preferred_client_genders column to trainer_profiles
ALTER TABLE trainer_profiles 
  ADD COLUMN IF NOT EXISTS preferred_client_genders TEXT[] DEFAULT ARRAY['all'];

-- Step 2: Update v_trainers view to include p.gender and tp.preferred_client_genders
DROP VIEW IF EXISTS v_trainers CASCADE;

CREATE OR REPLACE VIEW v_trainers AS
SELECT 
    -- Profile fields from profiles table
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
    p.gender,  -- ADDED: Trainer's gender
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
    
    -- Trainer-specific fields from trainer_profiles table
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
    tp.works_bank_holidays,
    tp.document_not_applicable,
    tp.preferred_client_genders,  -- ADDED: Trainer's preferred client genders
    tp.offers_discovery_call,
    tp.discovery_call_price
FROM 
    profiles p
LEFT JOIN 
    trainer_profiles tp ON p.id = tp.id
WHERE 
    p.user_type = 'trainer';