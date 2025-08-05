-- First, remove the default value from the existing column
ALTER TABLE public.profiles 
ALTER COLUMN client_status DROP DEFAULT;

-- Drop the old enum if it exists and create the new one
DROP TYPE IF EXISTS client_status CASCADE;

CREATE TYPE client_status AS ENUM (
  'onboarding',           -- Just signed up
  'survey_completed',     -- Completed initial preferences  
  'browsing',            -- Looking at trainers
  'shortlisted',         -- Has shortlisted trainer(s)
  'discovery_booked',    -- Has booked discovery call(s)
  'decision_pending',    -- Completed discovery calls, choosing
  'coach_selected'       -- Has chosen their coach
);

-- Update the existing client_status column to use the new enum
ALTER TABLE public.profiles 
ALTER COLUMN client_status TYPE client_status USING 'onboarding'::client_status;

-- Set a new default for the column
ALTER TABLE public.profiles 
ALTER COLUMN client_status SET DEFAULT 'onboarding'::client_status;

-- Update existing users based on their current state
UPDATE public.profiles 
SET client_status = (CASE
  WHEN client_survey_completed = true AND EXISTS (
    SELECT 1 FROM shortlisted_trainers WHERE user_id = profiles.id AND discovery_call_booked_at IS NOT NULL
  ) THEN 'discovery_booked'
  WHEN client_survey_completed = true AND EXISTS (
    SELECT 1 FROM shortlisted_trainers WHERE user_id = profiles.id
  ) THEN 'shortlisted'
  WHEN client_survey_completed = true THEN 'survey_completed'
  ELSE 'onboarding'
END)::client_status
WHERE user_type = 'client';

-- Create function to update client status automatically
CREATE OR REPLACE FUNCTION public.update_client_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update client status based on survey completion
  IF TG_TABLE_NAME = 'profiles' AND NEW.user_type = 'client' THEN
    IF NEW.client_survey_completed = true AND (OLD.client_survey_completed IS NULL OR OLD.client_survey_completed = false) THEN
      NEW.client_status = 'survey_completed'::client_status;
    END IF;
  END IF;
  
  -- Update client status when shortlisting trainers
  IF TG_TABLE_NAME = 'shortlisted_trainers' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.profiles 
      SET client_status = 'shortlisted'::client_status
      WHERE id = NEW.user_id AND client_status IN ('survey_completed'::client_status, 'browsing'::client_status);
    END IF;
    
    -- Update when discovery call is booked
    IF TG_OP = 'UPDATE' AND NEW.discovery_call_booked_at IS NOT NULL AND (OLD.discovery_call_booked_at IS NULL) THEN
      UPDATE public.profiles 
      SET client_status = 'discovery_booked'::client_status
      WHERE id = NEW.user_id AND client_status = 'shortlisted'::client_status;
    END IF;
  END IF;
  
  -- Update when discovery call is completed
  IF TG_TABLE_NAME = 'discovery_calls' AND TG_OP = 'UPDATE' AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.profiles 
    SET client_status = 'decision_pending'::client_status
    WHERE id = NEW.client_id AND client_status = 'discovery_booked'::client_status;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_client_status_on_profile_update ON public.profiles;
DROP TRIGGER IF EXISTS update_client_status_on_shortlist ON public.shortlisted_trainers;
DROP TRIGGER IF EXISTS update_client_status_on_discovery_call ON public.discovery_calls;

-- Create triggers
CREATE TRIGGER update_client_status_on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_status();

CREATE TRIGGER update_client_status_on_shortlist
  AFTER INSERT OR UPDATE ON public.shortlisted_trainers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_status();

CREATE TRIGGER update_client_status_on_discovery_call
  AFTER UPDATE ON public.discovery_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_status();