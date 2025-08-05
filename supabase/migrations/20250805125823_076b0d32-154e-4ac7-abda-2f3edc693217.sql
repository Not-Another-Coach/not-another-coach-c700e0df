-- Fix the search path security issue for the update_client_status function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';