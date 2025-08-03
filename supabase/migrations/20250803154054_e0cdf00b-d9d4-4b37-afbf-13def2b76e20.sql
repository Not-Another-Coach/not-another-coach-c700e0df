-- Add new client survey fields to profiles table for better trainer-client matching
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  -- Goals and preferences
  primary_goals TEXT[], -- Multiple goals with ranking
  secondary_goals TEXT[], -- Additional goals
  training_location_preference TEXT DEFAULT 'hybrid', -- 'in-person', 'online', 'hybrid'
  open_to_virtual_coaching BOOLEAN DEFAULT true,
  
  -- Training frequency and scheduling
  preferred_training_frequency INTEGER, -- days per week
  preferred_time_slots TEXT[], -- e.g., ['mornings', 'evenings', 'weekends']
  start_timeline TEXT DEFAULT 'flexible', -- 'urgent', 'next_month', 'flexible'
  
  -- Coaching style preferences
  preferred_coaching_style TEXT[], -- e.g., ['nurturing', 'tough_love', 'high_energy']
  motivation_factors TEXT[], -- What keeps them going
  
  -- Client self-description for trainer matching
  client_personality_type TEXT[], -- e.g., ['first_timer', 'self_motivated', 'routine_lover']
  experience_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  
  -- Package and budget preferences
  preferred_package_type TEXT DEFAULT 'ongoing', -- 'ongoing', 'short_term', 'single_session'
  budget_range_min DECIMAL(10,2),
  budget_range_max DECIMAL(10,2),
  budget_flexibility TEXT DEFAULT 'flexible', -- 'strict', 'flexible', 'negotiable'
  
  -- Waitlist and availability preferences
  waitlist_preference TEXT DEFAULT 'quality_over_speed', -- 'asap', 'quality_over_speed'
  flexible_scheduling BOOLEAN DEFAULT true,
  
  -- Survey completion tracking
  client_survey_completed BOOLEAN DEFAULT false,
  client_survey_completed_at TIMESTAMP WITH TIME ZONE,
  client_survey_step INTEGER DEFAULT 1,
  total_client_survey_steps INTEGER DEFAULT 8;

-- Add indexes for better matching performance
CREATE INDEX IF NOT EXISTS idx_profiles_primary_goals ON public.profiles USING GIN(primary_goals);
CREATE INDEX IF NOT EXISTS idx_profiles_training_location ON public.profiles(training_location_preference);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_coaching_style ON public.profiles USING GIN(preferred_coaching_style);
CREATE INDEX IF NOT EXISTS idx_profiles_client_personality ON public.profiles USING GIN(client_personality_type);
CREATE INDEX IF NOT EXISTS idx_profiles_budget_range ON public.profiles(budget_range_min, budget_range_max);
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON public.profiles(experience_level);

-- Function to update client survey completion status
CREATE OR REPLACE FUNCTION public.check_client_survey_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only check for clients
  IF NEW.user_type = 'client' THEN
    NEW.client_survey_completed := (
      NEW.primary_goals IS NOT NULL AND array_length(NEW.primary_goals, 1) > 0 AND
      NEW.training_location_preference IS NOT NULL AND
      NEW.preferred_training_frequency IS NOT NULL AND
      NEW.preferred_time_slots IS NOT NULL AND array_length(NEW.preferred_time_slots, 1) > 0 AND
      NEW.preferred_coaching_style IS NOT NULL AND array_length(NEW.preferred_coaching_style, 1) > 0 AND
      NEW.client_personality_type IS NOT NULL AND array_length(NEW.client_personality_type, 1) > 0 AND
      NEW.preferred_package_type IS NOT NULL
    );
    
    -- Set completion timestamp if just completed
    IF NEW.client_survey_completed = true AND OLD.client_survey_completed = false THEN
      NEW.client_survey_completed_at := now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for client survey completion
CREATE TRIGGER check_client_survey_completion_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_client_survey_completion();