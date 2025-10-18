-- Drop old function versions that reference tm.plan_type
DROP FUNCTION IF EXISTS public.get_trainer_membership_details(uuid);
DROP FUNCTION IF EXISTS public.change_trainer_plan(uuid, text, uuid);

-- Recreate get_trainer_membership_details with plan_definition_id
CREATE OR REPLACE FUNCTION public.get_trainer_membership_details(p_trainer_id uuid)
RETURNS TABLE (
  membership_id uuid,
  plan_definition_id uuid,
  plan_name text,
  display_name text,
  is_active boolean,
  payment_status text,
  renewal_date date,
  stripe_subscription_id text,
  stripe_customer_id text,
  has_package_commission boolean,
  commission_fee_type text,
  commission_fee_value_percent numeric,
  commission_fee_value_flat_cents integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id as membership_id,
    tm.plan_definition_id,
    mpd.plan_name,
    mpd.display_name,
    tm.is_active,
    tm.payment_status::text,
    tm.renewal_date,
    tm.stripe_subscription_id,
    tm.stripe_customer_id,
    mpd.has_package_commission,
    mpd.commission_fee_type,
    mpd.commission_fee_value_percent,
    mpd.commission_fee_value_flat_cents
  FROM trainer_membership tm
  JOIN membership_plan_definitions mpd ON mpd.id = tm.plan_definition_id
  WHERE tm.trainer_id = p_trainer_id 
    AND tm.is_active = true
  LIMIT 1;
END;
$function$;

-- Recreate change_trainer_plan with plan_definition_id
CREATE OR REPLACE FUNCTION public.change_trainer_plan(
  p_trainer_id uuid,
  p_new_plan_definition_id uuid,
  p_changed_by uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_membership RECORD;
  v_new_plan RECORD;
BEGIN
  -- Get current active membership
  SELECT tm.*, mpd.plan_name as current_plan_name
  INTO v_current_membership
  FROM trainer_membership tm
  JOIN membership_plan_definitions mpd ON mpd.id = tm.plan_definition_id
  WHERE tm.trainer_id = p_trainer_id 
    AND tm.is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active membership found for trainer';
  END IF;
  
  -- Get new plan details
  SELECT * INTO v_new_plan
  FROM membership_plan_definitions
  WHERE id = p_new_plan_definition_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan definition not found';
  END IF;
  
  -- Deactivate current membership
  UPDATE trainer_membership
  SET is_active = false,
      updated_at = now()
  WHERE id = v_current_membership.id;
  
  -- Create new membership record
  INSERT INTO trainer_membership (
    trainer_id,
    plan_definition_id,
    is_active,
    payment_status,
    renewal_date
  ) VALUES (
    p_trainer_id,
    p_new_plan_definition_id,
    true,
    'active',
    CURRENT_DATE + INTERVAL '1 month'
  );
  
  -- Log in history
  INSERT INTO trainer_membership_history (
    trainer_id,
    old_plan_definition_id,
    new_plan_definition_id,
    change_type,
    changed_by,
    effective_date
  ) VALUES (
    p_trainer_id,
    v_current_membership.plan_definition_id,
    p_new_plan_definition_id,
    CASE 
      WHEN v_new_plan.monthly_price_cents > (
        SELECT monthly_price_cents FROM membership_plan_definitions WHERE id = v_current_membership.plan_definition_id
      ) THEN 'upgrade'
      ELSE 'downgrade'
    END,
    COALESCE(p_changed_by, p_trainer_id),
    now()
  );
END;
$function$;