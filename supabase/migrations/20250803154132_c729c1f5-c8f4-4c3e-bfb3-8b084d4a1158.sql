-- Add new client survey fields to profiles table for better trainer-client matching
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS primary_goals TEXT[],
ADD COLUMN IF NOT EXISTS secondary_goals TEXT[],
ADD COLUMN IF NOT EXISTS training_location_preference TEXT DEFAULT 'hybrid',
ADD COLUMN IF NOT EXISTS open_to_virtual_coaching BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_training_frequency INTEGER,
ADD COLUMN IF NOT EXISTS preferred_time_slots TEXT[],
ADD COLUMN IF NOT EXISTS start_timeline TEXT DEFAULT 'flexible',
ADD COLUMN IF NOT EXISTS preferred_coaching_style TEXT[],
ADD COLUMN IF NOT EXISTS motivation_factors TEXT[],
ADD COLUMN IF NOT EXISTS client_personality_type TEXT[],
ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS preferred_package_type TEXT DEFAULT 'ongoing',
ADD COLUMN IF NOT EXISTS budget_range_min DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS budget_range_max DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS budget_flexibility TEXT DEFAULT 'flexible',
ADD COLUMN IF NOT EXISTS waitlist_preference TEXT DEFAULT 'quality_over_speed',
ADD COLUMN IF NOT EXISTS flexible_scheduling BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS client_survey_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS client_survey_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS client_survey_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_client_survey_steps INTEGER DEFAULT 8;

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
    IF NEW.client_survey_completed = true AND (OLD.client_survey_completed IS NULL OR OLD.client_survey_completed = false) THEN
      NEW.client_survey_completed_at := now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for client survey completion
DROP TRIGGER IF EXISTS check_client_survey_completion_trigger ON public.profiles;
CREATE TRIGGER check_client_survey_completion_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_client_survey_completion();