-- Create reactivate_trainer_plan function
CREATE OR REPLACE FUNCTION reactivate_trainer_plan()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trainer_id UUID := auth.uid();
  v_current_membership RECORD;
  v_history_id UUID;
BEGIN
  -- Get current membership
  SELECT tm.*, mpd.id as current_plan_id, mpd.display_name as current_plan_name
  INTO v_current_membership
  FROM trainer_membership tm
  JOIN membership_plan_definitions mpd ON tm.plan_definition_id = mpd.id
  WHERE tm.trainer_id = v_trainer_id AND tm.is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active membership found';
  END IF;

  -- Check if plan is marked for cancellation
  IF NOT v_current_membership.cancel_at_period_end THEN
    RAISE EXCEPTION 'Plan is not scheduled for cancellation';
  END IF;

  -- Reactivate the plan
  UPDATE trainer_membership
  SET 
    cancel_at_period_end = false,
    cancellation_grace_end = NULL,
    updated_at = now()
  WHERE trainer_id = v_trainer_id AND is_active = true;

  -- Create history record
  INSERT INTO trainer_membership_history (
    trainer_id, 
    from_plan_id, 
    to_plan_id,
    change_type,
    initiated_by, 
    initiated_by_user_id, 
    effective_date,
    previous_renewal_date, 
    new_renewal_date,
    reason,
    payment_status
  )
  VALUES (
    v_trainer_id, 
    v_current_membership.current_plan_id,
    v_current_membership.current_plan_id,
    'reactivate',
    'trainer', 
    v_trainer_id, 
    CURRENT_DATE,
    v_current_membership.renewal_date,
    v_current_membership.renewal_date,
    'Plan reactivated by trainer',
    'not_required'
  )
  RETURNING id INTO v_history_id;

  -- Create alert
  INSERT INTO alerts (
    alert_type, 
    title, 
    content, 
    target_audience, 
    metadata, 
    is_active
  )
  VALUES (
    'plan_reactivated',
    'Plan Reactivated',
    'Your ' || v_current_membership.current_plan_name || ' plan will continue as normal. Your next renewal is on ' || 
      v_current_membership.renewal_date::TEXT || '.',
    jsonb_build_object('trainers', jsonb_build_array(v_trainer_id)),
    jsonb_build_object(
      'history_id', v_history_id,
      'plan_name', v_current_membership.current_plan_name,
      'renewal_date', v_current_membership.renewal_date
    ),
    true
  );

  RETURN jsonb_build_object(
    'success', true,
    'renewal_date', v_current_membership.renewal_date,
    'history_id', v_history_id
  );
END;
$$;