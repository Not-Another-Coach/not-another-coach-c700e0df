-- Fix get_trainer_available_plans type mismatches and ambiguity
DROP FUNCTION IF EXISTS public.get_trainer_available_plans(uuid);

CREATE OR REPLACE FUNCTION public.get_trainer_available_plans(p_trainer_id uuid)
RETURNS TABLE (
  plan_id text,
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
SET search_path = public
AS $$
DECLARE
  current_plan_type text;
  current_renewal_date date;
  current_plan_price integer := 0;
  days_in_cycle integer := 30;
  days_remaining integer := 0;
BEGIN
  -- Get current plan info
  SELECT tm.plan_type::text, tm.renewal_date, tm.monthly_price_cents
  INTO current_plan_type, current_renewal_date, current_plan_price
  FROM trainer_membership tm
  WHERE tm.trainer_id = p_trainer_id AND tm.is_active = true;

  -- Calculate days remaining (prevent negative values)
  IF current_renewal_date IS NOT NULL THEN
    days_remaining := GREATEST((current_renewal_date - CURRENT_DATE), 0);
  END IF;

  RETURN QUERY
  SELECT 
    mpd.id::text AS plan_id,
    mpd.plan_type::text AS plan_name,
    mpd.display_name,
    mpd.monthly_price_cents,
    mpd.has_package_commission AS has_commission,
    jsonb_build_object(
      'fee_type', mpd.commission_fee_type,
      'fee_value_percent', mpd.commission_fee_value_percent,
      'fee_value_flat_cents', mpd.commission_fee_value_flat_cents
    )::jsonb AS commission_details,
    (mpd.plan_type::text = current_plan_type) AS is_current_plan,
    (current_plan_type IS NULL OR mpd.plan_type::text <> current_plan_type) AS can_switch_to,
    CASE 
      WHEN current_plan_type IS NULL THEN 'new'::text
      WHEN mpd.monthly_price_cents > COALESCE(current_plan_price, 0) THEN 'upgrade'::text
      ELSE 'downgrade'::text
    END AS switch_type,
    NULL::text AS blocked_reason,
    CASE 
      WHEN current_renewal_date IS NOT NULL AND mpd.monthly_price_cents > COALESCE(current_plan_price, 0) THEN
        COALESCE(
          ROUND(
            ((mpd.monthly_price_cents - COALESCE(current_plan_price, 0))::numeric
              * days_remaining::numeric
            ) / NULLIF(days_in_cycle, 0)::numeric
          )::integer,
          0
        )
      ELSE 0
    END::integer AS proration_estimate_cents
  FROM membership_plan_definitions mpd
  WHERE mpd.is_available_to_new_trainers = true
     OR mpd.plan_type::text = current_plan_type
  ORDER BY mpd.monthly_price_cents;
END;
$$;