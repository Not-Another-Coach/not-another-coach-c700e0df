-- Update user_in_target_audience to also support 'coaches' key
CREATE OR REPLACE FUNCTION public.user_in_target_audience(audience_json jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_type TEXT;
  current_user_id UUID;
  has_trainers_key BOOLEAN;
  has_coaches_key BOOLEAN;
  trainers_json jsonb;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- 'all' audience
  IF audience_json ? 'all' THEN
    RETURN true;
  END IF;
  
  -- admins audience
  IF audience_json ? 'admins' AND public.current_user_has_role('admin'::app_role) THEN
    RETURN true;
  END IF;
  
  -- Get user type
  SELECT user_type INTO current_user_type FROM public.profiles WHERE id = current_user_id;
  
  has_trainers_key := audience_json ? 'trainers';
  has_coaches_key := audience_json ? 'coaches';
  
  -- Trainer/coaches audience (treat 'coaches' as alias of 'trainers')
  IF current_user_type = 'trainer' THEN
    IF has_trainers_key OR has_coaches_key THEN
      trainers_json := CASE WHEN has_trainers_key THEN audience_json->'trainers' ELSE audience_json->'coaches' END;
      IF trainers_json = '"all"'::jsonb THEN
        RETURN true;
      ELSIF jsonb_typeof(trainers_json) = 'array' THEN
        RETURN trainers_json @> to_jsonb(current_user_id);
      ELSE
        RETURN false;
      END IF;
    END IF;
  END IF;
  
  -- Clients audience
  IF current_user_type = 'client' AND (audience_json ? 'clients') THEN
    IF audience_json->'clients' = '"all"'::jsonb THEN
      RETURN true;
    ELSIF jsonb_typeof(audience_json->'clients') = 'array' THEN
      RETURN audience_json->'clients' @> to_jsonb(current_user_id);
    END IF;
  END IF;
  
  RETURN false;
END;
$function$;