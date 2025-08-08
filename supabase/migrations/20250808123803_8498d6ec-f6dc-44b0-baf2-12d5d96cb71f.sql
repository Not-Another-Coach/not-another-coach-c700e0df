-- Fix the waitlist exclusive access logic to only allow clients who joined before the exclusive period started
CREATE OR REPLACE FUNCTION public.client_has_waitlist_exclusive_access(p_client_id uuid, p_coach_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.coach_waitlists cw
    JOIN public.waitlist_exclusive_periods wep ON wep.coach_id = cw.coach_id
    WHERE cw.client_id = p_client_id 
      AND cw.coach_id = p_coach_id
      AND cw.status = 'active'
      AND wep.is_active = true
      AND wep.expires_at > now()
      AND cw.joined_at < wep.created_at  -- Only clients who joined before the exclusive period started
  );
END;
$function$