-- Fix Security Definer View issues by removing SECURITY DEFINER from table-returning functions
-- and ensuring proper access control through function logic and RLS policies

-- 1. Fix get_activity_recommendations_for_template function
CREATE OR REPLACE FUNCTION public.get_activity_recommendations_for_template(p_trainer_id uuid, p_package_ids text[] DEFAULT NULL::text[])
 RETURNS TABLE(activity_id uuid, activity_name text, category text, usage_count bigint, source_packages text[])
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow trainers to get their own recommendations
  IF auth.uid() != p_trainer_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only access your own recommendations';
  END IF;

  RETURN QUERY
  SELECT 
    a.id as activity_id,
    a.activity_name,
    a.category,
    COALESCE(tau.total_usage, 0) as usage_count,
    COALESCE(
      array_agg(DISTINCT a.source_package_id) FILTER (WHERE a.source_package_id IS NOT NULL),
      '{}'::text[]
    ) as source_packages
  FROM public.trainer_onboarding_activities a
  LEFT JOIN (
    SELECT 
      activity_id,
      SUM(usage_count) as total_usage
    FROM public.template_activity_usage tau2
    JOIN public.onboarding_templates ot ON ot.id = tau2.template_id
    WHERE ot.trainer_id = p_trainer_id
    GROUP BY activity_id
  ) tau ON tau.activity_id = a.id
  WHERE a.trainer_id = p_trainer_id
    AND (p_package_ids IS NULL OR a.source_package_id = ANY(p_package_ids))
  GROUP BY a.id, a.activity_name, a.category, tau.total_usage
  ORDER BY tau.total_usage DESC NULLS LAST, a.activity_name;
END;
$function$;

-- 2. Fix get_admin_verification_activities function
CREATE OR REPLACE FUNCTION public.get_admin_verification_activities(days_back integer DEFAULT 7)
 RETURNS TABLE(id text, activity_type text, trainer_id uuid, trainer_name text, check_type text, status text, created_at timestamp with time zone, expires_at timestamp with time zone, priority text, days_until_expiry integer)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admin users to access this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    -- Recent admin actions on verification checks
    'admin_action_' || tval.id::text as id,
    'admin_verification_action' as activity_type,
    tval.trainer_id,
    COALESCE(p.first_name || ' ' || p.last_name, p.email) as trainer_name,
    tvc.check_type::text,
    tval.new_status::text as status,
    tval.created_at,
    NULL::timestamp with time zone as expires_at,
    'normal' as priority,
    NULL::integer as days_until_expiry
  FROM public.trainer_verification_audit_log tval
  JOIN public.trainer_verification_checks tvc ON tval.check_id = tvc.id
  JOIN public.profiles p ON tval.trainer_id = p.id
  WHERE tval.actor = 'admin' 
    AND tval.created_at > (now() - interval '1 day' * days_back)
    
  UNION ALL
  
  SELECT 
    -- Expiring certificates (within 14 days)
    'expiry_warning_' || tvc.id::text as id,
    'certificate_expiring' as activity_type,
    tvc.trainer_id,
    COALESCE(p.first_name || ' ' || p.last_name, p.email) as trainer_name,
    tvc.check_type::text,
    tvc.status::text,
    tvc.created_at,
    tvc.expiry_date::timestamp with time zone as expires_at,
    CASE WHEN tvc.expiry_date <= (CURRENT_DATE + 7) THEN 'high' ELSE 'normal' END as priority,
    (tvc.expiry_date - CURRENT_DATE)::integer as days_until_expiry
  FROM public.trainer_verification_checks tvc
  JOIN public.profiles p ON tvc.trainer_id = p.id
  WHERE tvc.status = 'verified'
    AND tvc.expiry_date IS NOT NULL
    AND tvc.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + 14)
    
  UNION ALL
  
  SELECT 
    -- Recently expired certificates (last 7 days)
    'expired_' || tvc.id::text as id,
    'certificate_expired' as activity_type,
    tvc.trainer_id,
    COALESCE(p.first_name || ' ' || p.last_name, p.email) as trainer_name,
    tvc.check_type::text,
    tvc.status::text,
    tvc.created_at,
    tvc.expiry_date::timestamp with time zone as expires_at,
    'high' as priority,
    (tvc.expiry_date - CURRENT_DATE)::integer as days_until_expiry
  FROM public.trainer_verification_checks tvc
  JOIN public.profiles p ON tvc.trainer_id = p.id
  WHERE tvc.status = 'expired'
    AND tvc.expiry_date IS NOT NULL
    AND tvc.expiry_date >= (CURRENT_DATE - days_back)
  
  ORDER BY created_at DESC, priority DESC
  LIMIT 50;
END;
$function$;