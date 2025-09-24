-- Drop and recreate all remaining SECURITY DEFINER functions without SECURITY DEFINER

-- 1. Fix get_secure_profile_data function (has parameter)
DROP FUNCTION IF EXISTS public.get_secure_profile_data(uuid);

CREATE OR REPLACE FUNCTION public.get_secure_profile_data(p_user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(id uuid, email text, first_name text, last_name text, user_type text)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow users to see their own data or admins to see all data
  IF p_user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    au.email::text,
    p.first_name,
    p.last_name,
    p.user_type::text
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.id = p_user_id;
END;
$function$;

-- 2. Drop and recreate get_system_default_visibility
DROP FUNCTION IF EXISTS public.get_system_default_visibility();

CREATE OR REPLACE FUNCTION public.get_system_default_visibility()
 RETURNS TABLE(content_type text, stage_group text, visibility_state text)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admin users to access system defaults
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    svd.content_type::text,
    svd.stage_group::text,
    svd.visibility_state::text
  FROM public.system_visibility_defaults svd
  ORDER BY svd.content_type, svd.stage_group;
END;
$function$;

-- 3. Drop and recreate get_trainer_membership_details
DROP FUNCTION IF EXISTS public.get_trainer_membership_details(uuid);

CREATE OR REPLACE FUNCTION public.get_trainer_membership_details(p_trainer_id uuid)
 RETURNS TABLE(membership_id uuid, plan_type text, monthly_price_cents integer, renewal_date date, proration_mode text, is_active boolean, fee_type text, fee_value_percent numeric, fee_value_flat_cents integer, fee_preview_text text)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow trainers to access their own membership details or admins to access any
  IF NOT (auth.uid() = p_trainer_id OR has_role(auth.uid(), 'admin'::app_role)) THEN
    RAISE EXCEPTION 'Unauthorized: Can only access your own membership details';
  END IF;

  RETURN QUERY
  SELECT 
    tm.id,
    tm.plan_type,
    tm.monthly_price_cents,
    tm.renewal_date,
    tm.proration_mode,
    tm.is_active,
    COALESCE(mcc.fee_type, 'percentage'::TEXT),
    COALESCE(mcc.fee_value_percent, 10.00),
    COALESCE(mcc.fee_value_flat_cents, 0),
    CASE 
      WHEN tm.plan_type = 'high' THEN 'No commission fees - you keep 100% of package payments'
      WHEN COALESCE(mcc.fee_type, 'percentage') = 'percentage' THEN 
        COALESCE(mcc.fee_value_percent, 10.00)::TEXT || '% commission will be deducted from each package'
      WHEN COALESCE(mcc.fee_type, 'percentage') = 'flat' THEN
        '£' || (COALESCE(mcc.fee_value_flat_cents, 0) / 100.0)::TEXT || ' will be deducted from each package'
      ELSE 'Commission details unavailable'
    END
  FROM public.trainer_membership tm
  LEFT JOIN (
    SELECT DISTINCT ON (trainer_id) 
      trainer_id, fee_type, fee_value_percent, fee_value_flat_cents
    FROM public.membership_commission_config
    WHERE trainer_id = p_trainer_id
      AND effective_from <= CURRENT_DATE
    ORDER BY trainer_id, effective_from DESC, created_at DESC
  ) mcc ON tm.trainer_id = mcc.trainer_id
  WHERE tm.trainer_id = p_trainer_id
    AND tm.is_active = true;
END;
$function$;

-- 4. Drop and recreate get_user_emails_for_admin
DROP FUNCTION IF EXISTS public.get_user_emails_for_admin();

CREATE OR REPLACE FUNCTION public.get_user_emails_for_admin()
 RETURNS TABLE(user_id uuid, email character varying)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admin users to access all user emails
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email IS NOT NULL
  ORDER BY au.created_at DESC;
END;
$function$;

-- 5. Drop and recreate get_user_emails_for_development
DROP FUNCTION IF EXISTS public.get_user_emails_for_development();

CREATE OR REPLACE FUNCTION public.get_user_emails_for_development()
 RETURNS TABLE(user_id uuid, email character varying)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow authenticated users in development mode
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

-- 6. Drop and recreate list_users_minimal_admin
DROP FUNCTION IF EXISTS public.list_users_minimal_admin();

CREATE OR REPLACE FUNCTION public.list_users_minimal_admin()
 RETURNS TABLE(id uuid, email text, first_name text, last_name text, user_type text, roles text[])
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admin users to list all users
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    au.email::text,
    p.first_name,
    p.last_name,
    p.user_type::text,
    COALESCE(
      array_agg(ur.role::text) FILTER (WHERE ur.role IS NOT NULL),
      '{}'::text[]
    ) as roles
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  GROUP BY p.id, au.email, p.first_name, p.last_name, p.user_type
  ORDER BY p.created_at DESC;
END;
$function$;