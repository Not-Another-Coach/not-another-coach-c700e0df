-- Fix ambiguous column reference in get_trainer_available_plans
DROP FUNCTION IF EXISTS get_trainer_available_plans(uuid);

CREATE OR REPLACE FUNCTION get_trainer_available_plans(p_trainer_id UUID)
RETURNS TABLE (
  plan_id TEXT,
  plan_name TEXT,
  display_name TEXT,
  monthly_price_cents INTEGER,
  has_commission BOOLEAN,
  commission_details JSONB,
  is_current_plan BOOLEAN,
  can_switch_to BOOLEAN,
  switch_type TEXT,
  blocked_reason TEXT,
  proration_estimate_cents INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_plan_type TEXT;
  current_renewal_date DATE;
  current_plan_price INTEGER;
  days_in_cycle INTEGER;
  days_remaining INTEGER;
BEGIN
  -- Get current plan info
  SELECT tm.plan_type, tm.renewal_date, tm.monthly_price_cents
  INTO current_plan_type, current_renewal_date, current_plan_price
  FROM trainer_membership tm
  WHERE tm.trainer_id = p_trainer_id AND tm.is_active = true;

  -- Calculate proration if needed
  IF current_renewal_date IS NOT NULL THEN
    days_in_cycle := 30;
    days_remaining := current_renewal_date - CURRENT_DATE;
  END IF;

  RETURN QUERY
  SELECT 
    mpd.id::TEXT as plan_id,
    mpd.plan_type as plan_name,
    mpd.display_name,
    mpd.monthly_price_cents,
    mpd.has_package_commission as has_commission,
    jsonb_build_object(
      'fee_type', mpd.commission_fee_type,
      'fee_value_percent', mpd.commission_fee_value_percent,
      'fee_value_flat_cents', mpd.commission_fee_value_flat_cents
    ) as commission_details,
    (mpd.plan_type = current_plan_type) as is_current_plan,
    (mpd.plan_type != current_plan_type OR current_plan_type IS NULL) as can_switch_to,
    CASE 
      WHEN current_plan_type IS NULL THEN 'new'
      WHEN mpd.monthly_price_cents > COALESCE(current_plan_price, 0) THEN 'upgrade'
      ELSE 'downgrade'
    END as switch_type,
    NULL::TEXT as blocked_reason,
    CASE 
      WHEN current_renewal_date IS NOT NULL AND mpd.monthly_price_cents > COALESCE(current_plan_price, 0)
      THEN ROUND((mpd.monthly_price_cents - COALESCE(current_plan_price, 0)) * days_remaining / days_in_cycle)
      ELSE 0
    END as proration_estimate_cents
  FROM membership_plan_definitions mpd
  WHERE mpd.is_available_to_new_trainers = true OR mpd.plan_type = current_plan_type
  ORDER BY mpd.monthly_price_cents;
END;
$$;