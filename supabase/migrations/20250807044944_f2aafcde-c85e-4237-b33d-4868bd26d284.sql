-- Fix the development function to handle correct email data type
DROP FUNCTION IF EXISTS public.get_user_emails_for_development();

CREATE OR REPLACE FUNCTION public.get_user_emails_for_development()
RETURNS TABLE(user_id uuid, email character varying)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow any authenticated user to access emails for development
  -- In production, this function should be dropped or restricted
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to access user emails';
  END IF;

  -- Return user IDs and emails from auth.users
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email IS NOT NULL
  ORDER BY au.created_at DESC;
END;
$function$;

-- Also fix the admin function to handle correct data type
DROP FUNCTION IF EXISTS public.get_user_emails_for_admin();

CREATE OR REPLACE FUNCTION public.get_user_emails_for_admin()
RETURNS TABLE(user_id uuid, email character varying)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow existing admins to access emails
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can access user emails';
  END IF;

  -- Return user IDs and emails from auth.users
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email IS NOT NULL
  ORDER BY au.created_at DESC;
END;
$function$;