-- Fix remaining references to tm.plan_type by updating dependent functions

-- 1) Replace calculate_package_commission (2-arg) to delegate to 3-arg
DROP FUNCTION IF EXISTS public.calculate_package_commission(uuid, integer);

CREATE OR REPLACE FUNCTION public.calculate_package_commission(
  p_trainer_id uuid,
  p_package_price_cents integer
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
BEGIN
  -- Delegate to 3-arg version with NULL package id
  RETURN public.calculate_package_commission(p_trainer_id, p_package_price_cents, NULL);
END;
$fn$;

-- 2) Replace calculate_package_commission (3-arg) to use plan_definition_id
DROP FUNCTION IF EXISTS public.calculate_package_commission(uuid, integer, uuid);

CREATE OR REPLACE FUNCTION public.calculate_package_commission(
  p_trainer_id uuid,
  p_package_price_cents integer,
  p_package_id uuid DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v_commission_snapshot JSONB;
  v_commission_amount INTEGER := 0;
  v_plan_def_id uuid;
  v_plan_def record;
  v_current_membership record;
BEGIN
  -- If package has an applied snapshot, use it
  IF p_package_id IS NOT NULL THEN
    SELECT applied_commission_snapshot INTO v_commission_snapshot
    FROM payment_packages
    WHERE id = p_package_id;
  END IF;

  IF v_commission_snapshot IS NOT NULL AND (v_commission_snapshot->>'has_commission')::BOOLEAN THEN
    IF (v_commission_snapshot->>'fee_type') = 'percentage' THEN
      v_commission_amount := ROUND(
        p_package_price_cents * (v_commission_snapshot->>'fee_value_percent')::NUMERIC / 100
      );
    ELSIF (v_commission_snapshot->>'fee_type') = 'flat' THEN
      v_commission_amount := (v_commission_snapshot->>'fee_value_flat_cents')::INTEGER;
    END IF;
    RETURN COALESCE(v_commission_amount, 0);
  END IF;

  -- Fallback to trainer's active membership plan definition
  SELECT tm.plan_definition_id, tm.*
  INTO v_current_membership
  FROM public.trainer_membership tm
  WHERE tm.trainer_id = p_trainer_id
    AND tm.is_active = true
  ORDER BY tm.updated_at DESC
  LIMIT 1;

  IF NOT FOUND OR v_current_membership.plan_definition_id IS NULL THEN
    RETURN 0; -- no active membership => no commission
  END IF;

  v_plan_def_id := v_current_membership.plan_definition_id;

  SELECT * INTO v_plan_def
  FROM public.membership_plan_definitions mpd
  WHERE mpd.id = v_plan_def_id;

  IF NOT FOUND OR v_plan_def.has_package_commission = false THEN
    RETURN 0;
  END IF;

  IF v_plan_def.commission_fee_type = 'percentage' THEN
    v_commission_amount := ROUND(p_package_price_cents * v_plan_def.commission_fee_value_percent / 100);
  ELSIF v_plan_def.commission_fee_type = 'flat' THEN
    v_commission_amount := v_plan_def.commission_fee_value_flat_cents;
  ELSE
    v_commission_amount := 0;
  END IF;

  RETURN COALESCE(v_commission_amount, 0);
END;
$fn$;

-- 3) Recreate get_trainer_available_plans to use plan_definition_id and return rows
DROP FUNCTION IF EXISTS public.get_trainer_available_plans(uuid);

CREATE OR REPLACE FUNCTION public.get_trainer_available_plans(
  p_trainer_id uuid
) RETURNS TABLE (
  plan_id uuid,
  plan_name text,
  display_name text,
  monthly_price_cents integer,
  has_commission boolean,
  commission_details jsonb,
  is_current_plan boolean,
  can_switch_to boolean,
  switch_type text,
  blocked_reason text,
  proration_estimate_cents integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
as $fn$
DECLARE
  v_current record;
  v_today date := CURRENT_DATE;
  v_days_left integer;
  v_cycle_days integer;
  v_ratio numeric := 0;
BEGIN
  -- Get current active membership and its plan def
  SELECT tm.*, mpd.monthly_price_cents, mpd.display_name, mpd.plan_name
  INTO v_current
  FROM public.trainer_membership tm
  JOIN public.membership_plan_definitions mpd ON mpd.id = tm.plan_definition_id
  WHERE tm.trainer_id = p_trainer_id
    AND tm.is_active = true
  ORDER BY tm.updated_at DESC
  LIMIT 1;

  IF v_current.renewal_date IS NOT NULL THEN
    v_days_left := GREATEST(0, (v_current.renewal_date::date - v_today));
    v_cycle_days :=  GREATEST(1, (v_current.renewal_date::date - (v_current.renewal_date::date - INTERVAL '1 month')::date));
    v_ratio := LEAST(1, GREATEST(0, v_days_left::numeric / v_cycle_days::numeric));
  END IF;

  RETURN QUERY
  SELECT 
    mpd.id AS plan_id,
    mpd.plan_name,
    mpd.display_name,
    mpd.monthly_price_cents,
    mpd.has_package_commission AS has_commission,
    jsonb_build_object(
      'fee_type', mpd.commission_fee_type,
      'fee_value_percent', mpd.commission_fee_value_percent,
      'fee_value_flat_cents', mpd.commission_fee_value_flat_cents
    ) AS commission_details,
    (v_current.plan_definition_id IS NOT NULL AND mpd.id = v_current.plan_definition_id) AS is_current_plan,
    (v_current.plan_definition_id IS NULL OR mpd.id <> v_current.plan_definition_id) AS can_switch_to,
    CASE 
      WHEN v_current.plan_definition_id IS NULL OR mpd.id = v_current.plan_definition_id THEN NULL
      WHEN mpd.monthly_price_cents > COALESCE(v_current.monthly_price_cents, 0) THEN 'upgrade'
      ELSE 'downgrade'
    END AS switch_type,
    NULL::text AS blocked_reason,
    CASE 
      WHEN v_current.plan_definition_id IS NULL OR mpd.id = v_current.plan_definition_id THEN 0
      WHEN mpd.monthly_price_cents > COALESCE(v_current.monthly_price_cents, 0) THEN 
        ROUND((mpd.monthly_price_cents - COALESCE(v_current.monthly_price_cents, 0)) * v_ratio)::integer
      ELSE 0
    END AS proration_estimate_cents
  FROM public.membership_plan_definitions mpd
  WHERE COALESCE(mpd.is_active, true) = true
  ORDER BY mpd.monthly_price_cents ASC;
END;
$fn$;