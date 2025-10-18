-- Fix admin_create_membership_plan and admin_update_membership_plan functions
-- Remove p_plan_type from create function and add p_plan_name to update function

-- Drop existing functions
DROP FUNCTION IF EXISTS public.admin_create_membership_plan(TEXT, TEXT, TEXT, INTEGER, BOOLEAN, TEXT, NUMERIC, INTEGER, BOOLEAN, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_update_membership_plan(UUID, TEXT, TEXT, INTEGER, BOOLEAN, TEXT, NUMERIC, INTEGER, BOOLEAN, TEXT, TEXT);

-- Recreate admin_create_membership_plan WITHOUT p_plan_type parameter
CREATE OR REPLACE FUNCTION public.admin_create_membership_plan(
  p_plan_name TEXT,
  p_display_name TEXT,
  p_description TEXT,
  p_monthly_price_cents INTEGER,
  p_has_package_commission BOOLEAN,
  p_commission_fee_type TEXT,
  p_commission_fee_value_percent NUMERIC,
  p_commission_fee_value_flat_cents INTEGER,
  p_is_available_to_new_trainers BOOLEAN,
  p_stripe_product_id TEXT,
  p_stripe_price_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create membership plans';
  END IF;

  -- Insert the membership plan
  INSERT INTO membership_plan_definitions (
    plan_name,
    display_name,
    description,
    monthly_price_cents,
    has_package_commission,
    commission_fee_type,
    commission_fee_value_percent,
    commission_fee_value_flat_cents,
    is_available_to_new_trainers,
    stripe_product_id,
    stripe_price_id,
    is_active
  )
  VALUES (
    p_plan_name,
    p_display_name,
    p_description,
    p_monthly_price_cents,
    p_has_package_commission,
    p_commission_fee_type,
    p_commission_fee_value_percent,
    p_commission_fee_value_flat_cents,
    p_is_available_to_new_trainers,
    p_stripe_product_id,
    p_stripe_price_id,
    true
  )
  RETURNING id INTO v_plan_id;

  -- Log admin action
  PERFORM log_admin_action(
    NULL,
    'create_membership_plan',
    jsonb_build_object(
      'plan_id', v_plan_id,
      'plan_name', p_plan_name
    ),
    'Created new membership plan'
  );

  RETURN v_plan_id;
END;
$$;

-- Recreate admin_update_membership_plan WITH p_plan_name parameter
CREATE OR REPLACE FUNCTION public.admin_update_membership_plan(
  p_plan_id UUID,
  p_plan_name TEXT,
  p_display_name TEXT,
  p_description TEXT,
  p_monthly_price_cents INTEGER,
  p_has_package_commission BOOLEAN,
  p_commission_fee_type TEXT,
  p_commission_fee_value_percent NUMERIC,
  p_commission_fee_value_flat_cents INTEGER,
  p_is_available_to_new_trainers BOOLEAN,
  p_stripe_product_id TEXT,
  p_stripe_price_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update membership plans';
  END IF;

  -- Update the membership plan
  UPDATE membership_plan_definitions
  SET
    plan_name = COALESCE(p_plan_name, plan_name),
    display_name = COALESCE(p_display_name, display_name),
    description = p_description,
    monthly_price_cents = COALESCE(p_monthly_price_cents, monthly_price_cents),
    has_package_commission = COALESCE(p_has_package_commission, has_package_commission),
    commission_fee_type = p_commission_fee_type,
    commission_fee_value_percent = p_commission_fee_value_percent,
    commission_fee_value_flat_cents = p_commission_fee_value_flat_cents,
    is_available_to_new_trainers = COALESCE(p_is_available_to_new_trainers, is_available_to_new_trainers),
    stripe_product_id = p_stripe_product_id,
    stripe_price_id = p_stripe_price_id,
    updated_at = now()
  WHERE id = p_plan_id;

  -- Log admin action
  PERFORM log_admin_action(
    NULL,
    'update_membership_plan',
    jsonb_build_object('plan_id', p_plan_id),
    'Updated membership plan'
  );
END;
$$;