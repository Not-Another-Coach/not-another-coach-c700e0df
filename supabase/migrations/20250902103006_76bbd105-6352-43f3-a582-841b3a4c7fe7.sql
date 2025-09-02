-- Phase 1: Create new table structure

-- Create trainer_profiles table for trainer-specific data
CREATE TABLE public.trainer_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Credentials & Qualifications
  specializations text[],
  qualifications text[],
  certifying_body text,
  year_certified integer,
  uploaded_certificates jsonb DEFAULT '[]'::jsonb,
  
  -- Business Operations
  hourly_rate numeric(8,2),
  package_options jsonb DEFAULT '[]'::jsonb,
  availability_schedule jsonb DEFAULT '{}'::jsonb,
  max_clients integer,
  works_bank_holidays boolean DEFAULT false,
  
  -- Verification & Trust
  verification_status text DEFAULT 'pending',
  verification_requested_at timestamptz,
  verification_documents jsonb DEFAULT '[]'::jsonb,
  admin_verification_notes text,
  admin_review_notes text,
  is_verified boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 0,
  total_ratings integer DEFAULT 0,
  
  -- Service Details
  free_discovery_call boolean DEFAULT false,
  offers_discovery_call boolean DEFAULT false,
  discovery_call_price numeric(8,2),
  calendar_link text,
  testimonials jsonb DEFAULT '[]'::jsonb,
  training_types text[],
  delivery_format text[],
  communication_style text[],
  
  -- Additional Services
  video_checkins boolean DEFAULT false,
  messaging_support boolean DEFAULT false,
  weekly_programming_only boolean DEFAULT false,
  
  -- Ways of Working
  ways_of_working_onboarding text[],
  ways_of_working_first_week text[],
  ways_of_working_ongoing text[],
  ways_of_working_tracking text[],
  ways_of_working_expectations text[],
  ways_of_working_what_i_bring text[],
  
  -- Profile Setup
  profile_setup_completed boolean DEFAULT false,
  terms_agreed boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client_profiles table for client-specific data
CREATE TABLE public.client_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Goals & Preferences
  primary_goals text[],
  secondary_goals text[],
  fitness_goals text[],
  experience_level text,
  
  -- Training Preferences
  preferred_training_frequency text,
  preferred_time_slots text[],
  start_timeline text,
  preferred_coaching_style text[],
  motivation_factors text[],
  client_personality_type text[],
  training_location_preference text,
  open_to_virtual_coaching boolean DEFAULT false,
  
  -- Budget
  budget_range_min numeric(8,2),
  budget_range_max numeric(8,2),
  budget_flexibility text,
  
  -- Preferences
  waitlist_preference boolean DEFAULT false,
  flexible_scheduling boolean DEFAULT false,
  preferred_package_type text,
  
  -- Quiz & Survey Data
  quiz_completed boolean DEFAULT false,
  quiz_answers jsonb DEFAULT '{}'::jsonb,
  quiz_completed_at timestamptz,
  client_survey_completed boolean DEFAULT false,
  client_survey_completed_at timestamptz,
  
  -- Journey & Status
  client_status text DEFAULT 'onboarding',
  client_journey_stage text,
  journey_progress jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trainer_profiles
CREATE POLICY "Trainers can manage their own profile"
  ON public.trainer_profiles
  FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Public can view published trainer profiles"
  ON public.trainer_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = trainer_profiles.id 
        AND p.profile_published = true 
        AND p.user_type = 'trainer'
    )
  );

CREATE POLICY "Admins can manage all trainer profiles"
  ON public.trainer_profiles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for client_profiles
CREATE POLICY "Clients can manage their own profile"
  ON public.client_profiles
  FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Trainers can view their clients' profiles"
  ON public.client_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_trainer_engagement cte
      WHERE cte.client_id = client_profiles.id 
        AND cte.trainer_id = auth.uid()
        AND cte.stage IN ('matched', 'discovery_completed', 'active_client')
    )
  );

CREATE POLICY "Admins can manage all client profiles"
  ON public.client_profiles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Phase 2: Create helper views

-- View for trainers with all their data
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

-- View for clients with all their data
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

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION update_trainer_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_client_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trainer_profiles_updated_at
  BEFORE UPDATE ON public.trainer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_trainer_profile_updated_at();

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_client_profile_updated_at();

-- Create function to automatically create profile records when profiles are created
CREATE OR REPLACE FUNCTION create_domain_profile()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_domain_profile_on_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_domain_profile();