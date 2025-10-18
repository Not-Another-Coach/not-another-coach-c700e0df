-- Fix change_trainer_plan to use plan_definition_id instead of plan_type
DROP FUNCTION IF EXISTS public.change_trainer_plan(uuid, text);

CREATE OR REPLACE FUNCTION public.change_trainer_plan(
  p_requested_plan_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trainer_id UUID := auth.uid();
  v_current_membership RECORD;
  v_requested_plan RECORD;
  v_change_type TEXT;
  v_proration_cents INTEGER := 0;
  v_days_remaining INTEGER;
  v_unpaid_check JSONB;
  v_history_id UUID;
BEGIN
  v_unpaid_check := has_unpaid_invoices(v_trainer_id);
  
  -- Fixed: Use plan_definition_id instead of plan_type
  SELECT tm.*, tm.plan_definition_id as current_plan_id
  INTO v_current_membership
  FROM trainer_membership tm
  WHERE tm.trainer_id = v_trainer_id AND tm.is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active membership found';
  END IF;

  SELECT * INTO v_requested_plan
  FROM membership_plan_definitions
  WHERE id = p_requested_plan_id AND is_active = true AND is_available_to_new_trainers = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Requested plan is not available';
  END IF;

  IF v_requested_plan.monthly_price_cents > v_current_membership.monthly_price_cents THEN
    v_change_type := 'upgrade';
    
    IF (v_unpaid_check->>'has_unpaid')::BOOLEAN THEN
      RAISE EXCEPTION 'Cannot upgrade with unpaid invoices. Please settle outstanding balance first.';
    END IF;
    
    v_days_remaining := GREATEST(0, v_current_membership.renewal_date - CURRENT_DATE);
    v_proration_cents := ROUND(
      (v_requested_plan.monthly_price_cents - v_current_membership.monthly_price_cents) 
      * v_days_remaining / 30.0
    );
    
  ELSIF v_requested_plan.monthly_price_cents < v_current_membership.monthly_price_cents THEN
    v_change_type := 'downgrade';
  ELSE
    v_change_type := 'switch';
  END IF;

  IF v_change_type = 'upgrade' THEN
    -- Fixed: Use plan_definition_id instead of plan_type
    UPDATE trainer_membership
    SET 
      plan_definition_id = v_requested_plan.id,
      monthly_price_cents = v_requested_plan.monthly_price_cents,
      updated_at = now()
    WHERE trainer_id = v_trainer_id AND is_active = true;

    INSERT INTO trainer_membership_history (
      trainer_id, from_plan_id, to_plan_id, change_type, 
      initiated_by, initiated_by_user_id, effective_date,
      prorated_amount_cents, previous_renewal_date, new_renewal_date,
      reason, applied_at
    )
    VALUES (
      v_trainer_id, v_current_membership.current_plan_id, p_requested_plan_id,
      v_change_type, 'trainer', v_trainer_id, CURRENT_DATE,
      v_proration_cents, v_current_membership.renewal_date, v_current_membership.renewal_date,
      p_reason, now()
    )
    RETURNING id INTO v_history_id;

    INSERT INTO alerts (alert_type, title, content, target_audience, metadata, is_active)
    VALUES (
      'plan_upgraded',
      'Plan Upgraded Successfully',
      'Your plan has been upgraded to ' || v_requested_plan.display_name || '. Prorated charge: £' || (v_proration_cents / 100.0)::TEXT,
      jsonb_build_object('trainers', jsonb_build_array(v_trainer_id)),
      jsonb_build_object(
        'history_id', v_history_id,
        'new_plan', v_requested_plan.display_name,
        'proration_cents', v_proration_cents
      ),
      true
    );

    RETURN jsonb_build_object(
      'success', true,
      'change_type', v_change_type,
      'effective_date', CURRENT_DATE,
      'proration_cents', v_proration_cents,
      'history_id', v_history_id
    );
  ELSE
    INSERT INTO trainer_membership_history (
      trainer_id, from_plan_id, to_plan_id, change_type,
      initiated_by, initiated_by_user_id, effective_date,
      previous_renewal_date, new_renewal_date, reason
    )
    VALUES (
      v_trainer_id, v_current_membership.current_plan_id, p_requested_plan_id,
      v_change_type, 'trainer', v_trainer_id, v_current_membership.renewal_date,
      v_current_membership.renewal_date, v_current_membership.renewal_date, p_reason
    )
    RETURNING id INTO v_history_id;

    INSERT INTO alerts (alert_type, title, content, target_audience, metadata, is_active)
    VALUES (
      'plan_downgrade_scheduled',
      'Plan Downgrade Scheduled',
      'Your plan will change to ' || v_requested_plan.display_name || ' on ' || v_current_membership.renewal_date::TEXT,
      jsonb_build_object('trainers', jsonb_build_array(v_trainer_id)),
      jsonb_build_object(
        'history_id', v_history_id,
        'new_plan', v_requested_plan.display_name,
        'effective_date', v_current_membership.renewal_date
      ),
      true
    );

    RETURN jsonb_build_object(
      'success', true,
      'change_type', v_change_type,
      'effective_date', v_current_membership.renewal_date,
      'proration_cents', 0,
      'history_id', v_history_id,
      'message', 'Downgrade scheduled for next renewal date'
    );
  END IF;
END;
$$;