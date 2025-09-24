-- Fix parameter name conflict for get_user_roles function

-- Drop and recreate get_user_roles function with correct parameter name
DROP FUNCTION IF EXISTS public.get_user_roles(uuid);

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
 RETURNS TABLE(role app_role)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow users to get their own roles or admins to get any user's roles
  IF NOT (auth.uid() = _user_id OR has_role(auth.uid(), 'admin'::app_role)) THEN
    RAISE EXCEPTION 'Unauthorized: Can only access your own roles';
  END IF;

  RETURN QUERY
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id;
END;
$function$;