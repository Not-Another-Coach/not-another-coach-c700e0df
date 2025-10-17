-- Create cancel_trainer_plan function
CREATE OR REPLACE FUNCTION cancel_trainer_plan(
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
  v_history_id UUID;
BEGIN
  -- Get current membership
  SELECT tm.*, mpd.id as current_plan_id, mpd.display_name as current_plan_name
  INTO v_current_membership
  FROM trainer_membership tm
  JOIN membership_plan_definitions mpd ON tm.plan_type = mpd.plan_type
  WHERE tm.trainer_id = v_trainer_id AND tm.is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active membership found';
  END IF;

  -- Mark for cancellation at renewal date
  UPDATE trainer_membership
  SET 
    payment_status = 'cancellation_scheduled',
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
    reason
  )
  VALUES (
    v_trainer_id, 
    v_current_membership.current_plan_id,
    NULL,
    'cancellation',
    'trainer', 
    v_trainer_id, 
    v_current_membership.renewal_date,
    v_current_membership.renewal_date,
    NULL,
    p_reason
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
    'plan_cancellation_scheduled',
    'Plan Cancellation Scheduled',
    'Your ' || v_current_membership.current_plan_name || ' plan will remain active until ' || 
      v_current_membership.renewal_date::TEXT || '. You can reactivate anytime before then.',
    jsonb_build_object('trainers', jsonb_build_array(v_trainer_id)),
    jsonb_build_object(
      'history_id', v_history_id,
      'plan_name', v_current_membership.current_plan_name,
      'effective_date', v_current_membership.renewal_date,
      'reason', p_reason
    ),
    true
  );

  RETURN jsonb_build_object(
    'success', true,
    'effective_date', v_current_membership.renewal_date,
    'history_id', v_history_id
  );
END;
$$;