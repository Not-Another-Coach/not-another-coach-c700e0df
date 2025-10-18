-- Fix payment_status value in admin_assign_trainer_membership_plan
DROP FUNCTION IF EXISTS admin_assign_trainer_membership_plan(uuid, uuid, text);

CREATE OR REPLACE FUNCTION admin_assign_trainer_membership_plan(
  p_trainer_id uuid,
  p_plan_definition_id uuid,
  p_notes text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_monthly_price_cents integer;
  v_display_name text;
  v_membership_id uuid;
BEGIN
  -- Only admins can assign membership plans
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can assign membership plans';
  END IF;

  -- Get plan details from plan definition
  SELECT monthly_price_cents, display_name
  INTO v_monthly_price_cents, v_display_name
  FROM membership_plan_definitions
  WHERE id = p_plan_definition_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan definition not found or inactive';
  END IF;

  -- Deactivate any existing active memberships for this trainer
  UPDATE trainer_membership
  SET is_active = false,
      updated_at = now()
  WHERE trainer_id = p_trainer_id AND is_active = true;

  -- Create new membership record with plan_definition_id
  INSERT INTO trainer_membership (
    trainer_id,
    plan_definition_id,
    monthly_price_cents,
    renewal_date,
    is_active,
    payment_status
  )
  VALUES (
    p_trainer_id,
    p_plan_definition_id,
    v_monthly_price_cents,
    (CURRENT_DATE + INTERVAL '1 month')::date,
    true,
    'current'
  )
  RETURNING id INTO v_membership_id;

  -- Log the admin action
  INSERT INTO admin_actions_log (
    admin_id,
    target_user_id,
    action_type,
    action_details,
    reason
  )
  VALUES (
    auth.uid(),
    p_trainer_id,
    'assign_membership_plan',
    jsonb_build_object(
      'plan_definition_id', p_plan_definition_id,
      'plan_name', v_display_name,
      'monthly_price_cents', v_monthly_price_cents,
      'membership_id', v_membership_id
    ),
    COALESCE(p_notes, 'Membership plan assigned by admin')
  );

  RETURN v_membership_id::text;
END;
$$;