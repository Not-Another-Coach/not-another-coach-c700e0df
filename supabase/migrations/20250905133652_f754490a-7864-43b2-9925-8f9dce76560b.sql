CREATE OR REPLACE FUNCTION public.compute_trainer_verification_status(p_trainer_id uuid)
 RETURNS verification_overall_status
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  overview_record trainer_verification_overview;
  required_checks verification_check_type[] := ARRAY['cimspa_membership', 'insurance_proof', 'first_aid_certification'];
  current_check_type verification_check_type;
  check_status verification_check_status;
  has_expired_check BOOLEAN := false;
  all_verified BOOLEAN := true;
BEGIN
  -- Get the trainer's verification overview
  SELECT * INTO overview_record 
  FROM trainer_verification_overview 
  WHERE trainer_id = p_trainer_id;
  
  -- If no overview record or preference is hidden, return not_shown
  IF NOT FOUND OR overview_record.display_preference = 'hidden' THEN
    RETURN 'not_shown';
  END IF;
  
  -- Check each required verification type
  FOREACH current_check_type IN ARRAY required_checks LOOP
    SELECT status INTO check_status 
    FROM trainer_verification_checks 
    WHERE trainer_id = p_trainer_id AND check_type = current_check_type;
    
    -- If check doesn't exist or isn't verified
    IF NOT FOUND OR check_status != 'verified' THEN
      all_verified := false;
    END IF;
    
    -- If any check is expired
    IF check_status = 'expired' THEN
      has_expired_check := true;
    END IF;
  END LOOP;
  
  -- Determine overall status
  IF has_expired_check THEN
    RETURN 'expired';
  ELSIF all_verified THEN
    RETURN 'verified';
  ELSE
    RETURN 'not_shown';
  END IF;
END;
$function$