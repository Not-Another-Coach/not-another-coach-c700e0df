-- Create function to automatically update waitlist status when engagement changes
CREATE OR REPLACE FUNCTION public.sync_waitlist_status_with_engagement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- When engagement reaches active_client, mark waitlist as converted
  IF NEW.stage = 'active_client' AND (OLD.stage IS NULL OR OLD.stage != 'active_client') THEN
    UPDATE public.coach_waitlists
    SET 
      status = 'converted',
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND coach_id = NEW.trainer_id 
      AND status != 'converted';
  END IF;
  
  -- When engagement is reverted from active_client (shouldn't happen often), revert waitlist
  IF OLD.stage = 'active_client' AND NEW.stage != 'active_client' THEN
    UPDATE public.coach_waitlists
    SET 
      status = 'active',
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND coach_id = NEW.trainer_id 
      AND status = 'converted';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync waitlist status with engagement changes
DROP TRIGGER IF EXISTS sync_waitlist_status_trigger ON public.client_trainer_engagement;
CREATE TRIGGER sync_waitlist_status_trigger
  AFTER UPDATE ON public.client_trainer_engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_waitlist_status_with_engagement();

-- Update existing waitlist entries where engagement is already active_client
UPDATE public.coach_waitlists 
SET status = 'converted', updated_at = now()
WHERE status != 'converted' 
  AND EXISTS (
    SELECT 1 FROM public.client_trainer_engagement 
    WHERE client_trainer_engagement.client_id = coach_waitlists.client_id 
      AND client_trainer_engagement.trainer_id = coach_waitlists.coach_id 
      AND client_trainer_engagement.stage = 'active_client'
  );