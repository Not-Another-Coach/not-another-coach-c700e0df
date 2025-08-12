-- Admin-only RPC to list users with minimal fields for Auth screen
CREATE OR REPLACE FUNCTION public.list_users_minimal_admin()
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  user_type text,
  roles text[]
) AS $$
BEGIN
  -- Only admins may call this
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    au.email,
    p.first_name,
    p.last_name,
    (p.user_type)::text AS user_type,
    COALESCE(array_agg(ur.role)::text[], '{}') AS roles
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  GROUP BY p.id, au.email, p.first_name, p.last_name, p.user_type
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';