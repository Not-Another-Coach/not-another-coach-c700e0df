-- Fix security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION public.enforce_single_active_template()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If inserting a new active template, expire any existing active templates for this client
  IF NEW.status = 'active' THEN
    UPDATE public.client_template_assignments
    SET 
      status = 'expired',
      expired_at = now(),
      expiry_reason = 'Automatically expired due to new template assignment',
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id
      AND status = 'active'
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;