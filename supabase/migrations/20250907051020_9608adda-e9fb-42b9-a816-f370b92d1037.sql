-- Fix the notify_verification_status_change function to remove net schema dependency
CREATE OR REPLACE FUNCTION public.notify_verification_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Only trigger on actual status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Log the status change instead of calling external service
    RAISE NOTICE 'Verification status changed for trainer % check %: % -> %', 
      NEW.trainer_id, NEW.check_type, OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$;