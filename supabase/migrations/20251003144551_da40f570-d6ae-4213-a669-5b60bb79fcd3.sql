-- Create function to notify trainer when shortlisted
CREATE OR REPLACE FUNCTION notify_trainer_on_shortlist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_name TEXT;
BEGIN
  -- Only create alert when stage becomes 'shortlisted' (new or updated)
  IF (TG_OP = 'INSERT' AND NEW.stage = 'shortlisted') OR 
     (TG_OP = 'UPDATE' AND NEW.stage = 'shortlisted' AND (OLD.stage IS NULL OR OLD.stage != 'shortlisted')) THEN
    
    -- Get client name
    SELECT COALESCE(
      NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), ''),
      'A client'
    ) INTO client_name
    FROM profiles
    WHERE id = NEW.client_id;
    
    -- Create alert for the trainer
    INSERT INTO alerts (
      alert_type,
      title,
      content,
      target_audience,
      metadata,
      is_active,
      priority
    )
    VALUES (
      'client_shortlisted',
      'New Shortlist!',
      client_name || ' has shortlisted you! They are seriously interested in working with you.',
      jsonb_build_object('trainers', jsonb_build_array(NEW.trainer_id)),
      jsonb_build_object(
        'client_id', NEW.client_id,
        'trainer_id', NEW.trainer_id,
        'client_name', client_name,
        'engagement_stage', 'shortlisted',
        'shortlisted_at', now()
      ),
      true,
      2  -- Higher priority for shortlist notifications
    );
    
    -- Log for debugging
    RAISE NOTICE 'Created shortlist alert for trainer % from client %', NEW.trainer_id, NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on client_trainer_engagement
DROP TRIGGER IF EXISTS trigger_notify_trainer_on_shortlist ON client_trainer_engagement;

CREATE TRIGGER trigger_notify_trainer_on_shortlist
AFTER INSERT OR UPDATE OF stage ON client_trainer_engagement
FOR EACH ROW
EXECUTE FUNCTION notify_trainer_on_shortlist();