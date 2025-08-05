-- Fix the status field issue in triggers
-- First, let's check what triggers might be causing this and fix them

-- Drop and recreate the client status update trigger to handle missing status field
DROP TRIGGER IF EXISTS trigger_update_client_status ON profiles;
DROP TRIGGER IF EXISTS trigger_update_client_status ON shortlisted_trainers;
DROP TRIGGER IF EXISTS trigger_update_client_status ON discovery_calls;

CREATE OR REPLACE FUNCTION public.update_client_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    
    -- Update when discovery call is booked (check if field exists)
    IF TG_OP = 'UPDATE' AND NEW.discovery_call_booked_at IS NOT NULL AND (OLD.discovery_call_booked_at IS NULL) THEN
      UPDATE public.profiles 
      SET client_status = 'discovery_booked'::client_status
      WHERE id = NEW.user_id AND client_status = 'shortlisted'::client_status;
    END IF;
  END IF;
  
  -- Update when discovery call is completed (check if status field exists)
  IF TG_TABLE_NAME = 'discovery_calls' AND TG_OP = 'UPDATE' THEN
    -- Only proceed if status field exists in the record
    IF to_jsonb(NEW) ? 'status' AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
      UPDATE public.profiles 
      SET client_status = 'decision_pending'::client_status
      WHERE id = NEW.client_id AND client_status = 'discovery_booked'::client_status;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Recreate triggers
CREATE TRIGGER trigger_update_client_status
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_status();

-- Also relax the year_certified constraint to allow more reasonable values
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_year_certified_valid;

-- Add a more reasonable constraint (allow years from 1950 to current year + 1)
ALTER TABLE public.profiles ADD CONSTRAINT check_year_certified_valid 
  CHECK (year_certified IS NULL OR (year_certified >= 1950 AND year_certified <= EXTRACT(YEAR FROM CURRENT_DATE) + 1));