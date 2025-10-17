-- Phase 1.1: Add Failed Payment Tracking to trainer_membership
ALTER TABLE trainer_membership 
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('current', 'past_due', 'limited_mode', 'cancelled')) DEFAULT 'current',
ADD COLUMN IF NOT EXISTS grace_end_date DATE,
ADD COLUMN IF NOT EXISTS limited_mode_activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_blocked_reason TEXT,
ADD COLUMN IF NOT EXISTS last_payment_attempt_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_trainer_membership_payment_status ON trainer_membership(payment_status);
CREATE INDEX IF NOT EXISTS idx_trainer_membership_grace_end ON trainer_membership(grace_end_date) WHERE grace_end_date IS NOT NULL;

-- Phase 1.2: Add Failed Payment Config to app_settings
INSERT INTO app_settings (setting_key, setting_value, updated_by)
VALUES 
  ('failed_payment_config', jsonb_build_object(
    'grace_days', 7,
    'hard_cutoff_enabled', false,
    'hard_cutoff_after_days', 30,
    'hide_in_search_when_limited', true,
    'allow_downgrades_when_past_due', true,
    'block_upgrades_when_past_due', true
  ), NULL),
  ('stripe_retry_schedule', jsonb_build_object(
    'auto_retry_enabled', true,
    'retry_days', ARRAY[3, 5, 7, 14, 21, 30],
    'email_on_each_retry', false
  ), NULL)
ON CONFLICT (setting_key) DO NOTHING;

-- Phase 1.3: Create trainer_membership_history Table
CREATE TABLE IF NOT EXISTS trainer_membership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_plan_id UUID REFERENCES membership_plan_definitions(id),
  to_plan_id UUID REFERENCES membership_plan_definitions(id),
  change_type TEXT CHECK (change_type IN ('upgrade', 'downgrade', 'switch', 'cancel', 'reactivate', 'admin_override')),
  initiated_by TEXT CHECK (initiated_by IN ('trainer', 'admin', 'system', 'stripe_webhook')),
  initiated_by_user_id UUID REFERENCES profiles(id),
  effective_date DATE NOT NULL,
  applied_at TIMESTAMPTZ,
  prorated_amount_cents INTEGER,
  previous_renewal_date DATE,
  new_renewal_date DATE,
  commission_changes JSONB,
  reason TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_membership_history_trainer ON trainer_membership_history(trainer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_membership_history_effective ON trainer_membership_history(effective_date) WHERE applied_at IS NULL;

-- Enable RLS
ALTER TABLE trainer_membership_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainer_membership_history
CREATE POLICY "Trainers can view their own history"
  ON trainer_membership_history
  FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Admins can view all history"
  ON trainer_membership_history
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert history"
  ON trainer_membership_history
  FOR INSERT
  WITH CHECK (true);

-- Phase 1.4: Add Commission Snapshot to payment_packages
ALTER TABLE payment_packages 
ADD COLUMN IF NOT EXISTS applied_commission_plan_id UUID REFERENCES membership_plan_definitions(id),
ADD COLUMN IF NOT EXISTS applied_commission_snapshot JSONB,
ADD COLUMN IF NOT EXISTS engagement_stage_at_lock TEXT CHECK (engagement_stage_at_lock IN (
  'getting_to_know_your_coach', 
  'discovery_in_progress', 
  'matched', 
  'discovery_completed',
  'active_client'
)),
ADD COLUMN IF NOT EXISTS commission_locked_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_payment_packages_commission_plan ON payment_packages(applied_commission_plan_id);

-- Phase 1.5: Backfill Existing Data
UPDATE payment_packages pp
SET 
  applied_commission_plan_id = (
    SELECT mpd.id 
    FROM membership_plan_definitions mpd
    JOIN trainer_membership tm ON tm.plan_type = mpd.plan_type
    WHERE tm.trainer_id = pp.trainer_id AND tm.is_active = true
    LIMIT 1
  ),
  applied_commission_snapshot = (
    SELECT jsonb_build_object(
      'fee_type', mpd.commission_fee_type,
      'fee_value_percent', mpd.commission_fee_value_percent,
      'fee_value_flat_cents', mpd.commission_fee_value_flat_cents,
      'has_commission', mpd.has_package_commission
    )
    FROM membership_plan_definitions mpd
    JOIN trainer_membership tm ON tm.plan_type = mpd.plan_type
    WHERE tm.trainer_id = pp.trainer_id AND tm.is_active = true
    LIMIT 1
  ),
  engagement_stage_at_lock = 'getting_to_know_your_coach',
  commission_locked_at = COALESCE(pp.created_at, now())
WHERE applied_commission_plan_id IS NULL;

-- Phase 2: RPC Functions
-- 2.1: Get Available Plans (excluding archived)
CREATE OR REPLACE FUNCTION get_trainer_available_plans(p_trainer_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  plan_id UUID,
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
  current_plan_price INTEGER;
  current_renewal_date DATE;
  days_remaining INTEGER;
BEGIN
  SELECT tm.monthly_price_cents, tm.renewal_date
  INTO current_plan_price, current_renewal_date
  FROM trainer_membership tm
  WHERE tm.trainer_id = p_trainer_id AND tm.is_active = true;

  days_remaining := GREATEST(0, current_renewal_date - CURRENT_DATE);

  RETURN QUERY
  SELECT 
    mpd.id,
    mpd.plan_name,
    mpd.display_name,
    mpd.monthly_price_cents,
    mpd.has_package_commission,
    jsonb_build_object(
      'fee_type', mpd.commission_fee_type,
      'fee_value_percent', mpd.commission_fee_value_percent,
      'fee_value_flat_cents', mpd.commission_fee_value_flat_cents
    ),
    EXISTS(
      SELECT 1 FROM trainer_membership tm2
      WHERE tm2.trainer_id = p_trainer_id 
        AND tm2.plan_type = mpd.plan_type 
        AND tm2.is_active = true
    ) AS is_current,
    (mpd.is_active 
     AND mpd.is_available_to_new_trainers 
     AND NOT EXISTS(SELECT 1 FROM trainer_membership WHERE trainer_id = p_trainer_id AND plan_type = mpd.plan_type AND is_active = true)
    ) AS can_switch,
    CASE 
      WHEN mpd.monthly_price_cents > current_plan_price THEN 'upgrade'
      WHEN mpd.monthly_price_cents < current_plan_price THEN 'downgrade'
      ELSE 'switch'
    END AS switch_type,
    CASE 
      WHEN NOT mpd.is_active THEN 'Plan is no longer available'
      WHEN NOT mpd.is_available_to_new_trainers THEN 'Plan not open for selection'
      ELSE NULL
    END AS reason,
    CASE 
      WHEN mpd.monthly_price_cents > current_plan_price THEN
        ROUND((mpd.monthly_price_cents - current_plan_price) * days_remaining / 30.0)
      ELSE 0
    END AS proration_estimate
  FROM membership_plan_definitions mpd
  WHERE mpd.is_active = true 
    AND mpd.is_available_to_new_trainers = true
  ORDER BY mpd.monthly_price_cents ASC;
END;
$$;

-- 2.2: Check Unpaid Invoices
CREATE OR REPLACE FUNCTION has_unpaid_invoices(p_trainer_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unpaid_count INTEGER;
  total_unpaid_cents INTEGER;
  oldest_invoice_date DATE;
BEGIN
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount_cents), 0),
    MIN(period_start)
  INTO unpaid_count, total_unpaid_cents, oldest_invoice_date
  FROM billing_invoice
  WHERE trainer_id = p_trainer_id
    AND status IN ('issued', 'overdue', 'failed');

  RETURN jsonb_build_object(
    'has_unpaid', unpaid_count > 0,
    'count', unpaid_count,
    'total_amount_cents', total_unpaid_cents,
    'oldest_invoice_date', oldest_invoice_date
  );
END;
$$;

-- 2.3: Change Plan
CREATE OR REPLACE FUNCTION change_trainer_plan(
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
  
  SELECT tm.*, mpd.id as current_plan_id
  INTO v_current_membership
  FROM trainer_membership tm
  JOIN membership_plan_definitions mpd ON tm.plan_type = mpd.plan_type
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
    UPDATE trainer_membership
    SET 
      plan_type = v_requested_plan.plan_type,
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

-- 2.4: Update Commission Calculation
CREATE OR REPLACE FUNCTION calculate_package_commission(
  p_trainer_id UUID,
  p_package_price_cents INTEGER,
  p_package_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission_snapshot JSONB;
  v_commission_amount INTEGER := 0;
BEGIN
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
  ELSE
    SELECT 
      CASE 
        WHEN mpd.has_package_commission = false THEN 0
        WHEN mpd.commission_fee_type = 'percentage' THEN
          ROUND(p_package_price_cents * mpd.commission_fee_value_percent / 100)
        WHEN mpd.commission_fee_type = 'flat' THEN
          mpd.commission_fee_value_flat_cents
        ELSE 0
      END
    INTO v_commission_amount
    FROM trainer_membership tm
    JOIN membership_plan_definitions mpd ON tm.plan_type = mpd.plan_type
    WHERE tm.trainer_id = p_trainer_id AND tm.is_active = true;
  END IF;

  RETURN COALESCE(v_commission_amount, 0);
END;
$$;