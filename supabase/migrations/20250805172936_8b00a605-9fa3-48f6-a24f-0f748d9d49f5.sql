-- Fix search_path security issues by updating existing functions
CREATE OR REPLACE FUNCTION public.request_profile_verification(trainer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only the trainer themselves can request verification
  IF auth.uid() != trainer_id THEN
    RETURN false;
  END IF;
  
  -- Update verification status to pending and timestamp
  UPDATE public.profiles 
  SET 
    verification_status = 'pending',
    last_verification_request = now()
  WHERE id = trainer_id AND user_type = 'trainer';
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT user_type FROM public.profiles WHERE id = auth.uid();
$$;