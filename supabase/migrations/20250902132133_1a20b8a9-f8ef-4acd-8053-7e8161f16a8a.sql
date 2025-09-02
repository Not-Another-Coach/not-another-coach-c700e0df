-- Add missing columns to profiles table for client and trainer data

-- Client-specific columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_location_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_goals text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS client_status text DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS client_survey_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS client_journey_stage text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_training_frequency text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_time_slots text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_coaching_style text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS client_personality_type text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_package_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS client_survey_completed_at timestamp with time zone;

-- Trainer-specific columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specializations text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS qualifications text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_types text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discovery_call_settings jsonb DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS package_options jsonb DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_ratings integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

-- Journey and onboarding columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS journey_stage text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_onboarding_steps integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quiz_completed boolean DEFAULT false;

-- Profile completion tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_setup_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_agreed boolean DEFAULT false;

-- Additional useful columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability_schedule jsonb DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS before_after_photos jsonb DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_address jsonb DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_verification_notes text;