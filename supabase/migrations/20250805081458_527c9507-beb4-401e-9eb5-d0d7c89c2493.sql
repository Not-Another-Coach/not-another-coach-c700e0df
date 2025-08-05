-- Create client status enum
CREATE TYPE client_status AS ENUM (
  'onboarding',           -- Just signed up
  'survey_completed',     -- Completed initial preferences  
  'browsing',            -- Looking at trainers
  'shortlisted',         -- Has shortlisted trainer(s)
  'discovery_booked',    -- Has booked discovery call(s)
  'decision_pending',    -- Completed discovery calls, choosing
  'coach_selected'       -- Has chosen their coach
);

-- Add client_status field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN client_status client_status DEFAULT 'onboarding';

-- Update existing users based on their current state
UPDATE public.profiles 
SET client_status = CASE
  WHEN client_survey_completed = true AND EXISTS (
    SELECT 1 FROM shortlisted_trainers WHERE user_id = profiles.id AND discovery_call_booked_at IS NOT NULL
  ) THEN 'discovery_booked'
  WHEN client_survey_completed = true AND EXISTS (
    SELECT 1 FROM shortlisted_trainers WHERE user_id = profiles.id
  ) THEN 'shortlisted'
  WHEN client_survey_completed = true THEN 'survey_completed'
  ELSE 'onboarding'
END
WHERE user_type = 'client';

-- Create function to update client status automatically
CREATE OR REPLACE FUNCTION public.update_client_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update client status based on survey completion
  IF TG_TABLE_NAME = 'profiles' AND NEW.user_type = 'client' THEN
    IF NEW.client_survey_completed = true AND OLD.client_survey_completed = false THEN
      NEW.client_status = 'survey_completed';
    END IF;
  END IF;
  
  -- Update client status when shortlisting trainers
  IF TG_TABLE_NAME = 'shortlisted_trainers' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.profiles 
      SET client_status = 'shortlisted'
      WHERE id = NEW.user_id AND client_status IN ('survey_completed', 'browsing');
    END IF;
    
    -- Update when discovery call is booked
    IF TG_OP = 'UPDATE' AND NEW.discovery_call_booked_at IS NOT NULL AND OLD.discovery_call_booked_at IS NULL THEN
      UPDATE public.profiles 
      SET client_status = 'discovery_booked'
      WHERE id = NEW.user_id AND client_status = 'shortlisted';
    END IF;
  END IF;
  
  -- Update when discovery call is completed
  IF TG_TABLE_NAME = 'discovery_calls' AND TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles 
    SET client_status = 'decision_pending'
    WHERE id = NEW.client_id AND client_status = 'discovery_booked';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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