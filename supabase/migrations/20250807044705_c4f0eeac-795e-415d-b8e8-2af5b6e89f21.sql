-- Create a development function to get user emails with more permissive access
-- This should only be used in development environments
CREATE OR REPLACE FUNCTION public.get_user_emails_for_development()
RETURNS TABLE(user_id uuid, email text)
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