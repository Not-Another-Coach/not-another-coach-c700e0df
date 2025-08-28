-- Create atomic payment completion function
CREATE OR REPLACE FUNCTION public.complete_coach_selection_payment(
  p_client_id UUID,
  p_trainer_id UUID,
  p_payment_method TEXT DEFAULT 'manual',
  p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request coach_selection_requests%ROWTYPE;
  v_package_id UUID;
  v_payment_id UUID;
  v_result JSONB;
BEGIN
  -- Get the coach selection request
  SELECT * INTO v_request
  FROM coach_selection_requests
  WHERE client_id = p_client_id 
    AND trainer_id = p_trainer_id
    AND status IN ('pending', 'accepted', 'awaiting_payment')
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'No valid coach selection request found for client % and trainer %', p_client_id, p_trainer_id;
  END IF;
  
  -- Create payment package
  INSERT INTO payment_packages (
    trainer_id,
    customer_id,
    coach_selection_request_id,
    title,
    start_date,
    duration_weeks,
    list_price_currency,
    list_price_amount,
    final_price_currency,
    final_price_amount,
    payout_frequency,
    customer_payment_mode,
    status
  ) VALUES (
    p_trainer_id,
    p_client_id,
    v_request.id,
    v_request.package_name,
    NOW(), -- Start date set to now
    CASE 
      WHEN v_request.package_duration ILIKE '%week%' THEN 
        CAST(regexp_replace(v_request.package_duration, '[^0-9]', '', 'g') AS INTEGER)
      ELSE 4 -- Default to 4 weeks if not parseable
    END,
    'GBP', -- Default currency
    COALESCE(v_request.package_price, 0),
    'GBP',
    COALESCE(v_request.package_price, 0),
    'weekly', -- Default payout frequency
    'upfront', -- Default payment mode
    'active'
  ) RETURNING id INTO v_package_id;
  
  -- Create customer payment record
  INSERT INTO customer_payments (
    package_id,
    stripe_payment_intent_id,
    paid_at,
    amount_currency,
    amount_value,
    payment_method,
    status
  ) VALUES (
    v_package_id,
    p_stripe_payment_intent_id,
    NOW(),
    'GBP',
    COALESCE(v_request.package_price, 0),
    p_payment_method,
    'succeeded'
  ) RETURNING id INTO v_payment_id;
  
  -- Update coach selection request status
  UPDATE coach_selection_requests
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE id = v_request.id;
  
  -- Update engagement stage to active_client
  PERFORM update_engagement_stage(
    p_client_id,
    p_trainer_id,
    'active_client'::engagement_stage
  );
  
  -- Return success result
  v_result := jsonb_build_object(
    'success', true,
    'package_id', v_package_id,
    'payment_id', v_payment_id,
    'request_id', v_request.id
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    v_result := jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN v_result;
END;
$$;

-- Backfill Client Lou's payment package
DO $$
DECLARE
  client_lou_id UUID;
  trainer_lou_id UUID;
  result JSONB;
BEGIN
  -- Find Client Lou and Trainer Lou IDs
  SELECT id INTO client_lou_id 
  FROM public.profiles 
  WHERE first_name ILIKE '%lou%' AND user_type = 'client'
  LIMIT 1;

  SELECT id INTO trainer_lou_id 
  FROM public.profiles 
  WHERE first_name ILIKE '%lou%' AND user_type = 'trainer'
  LIMIT 1;

  -- Only proceed if both are found and no payment package exists yet
  IF client_lou_id IS NOT NULL AND trainer_lou_id IS NOT NULL THEN
    -- Check if payment package already exists
    IF NOT EXISTS (
      SELECT 1 FROM payment_packages 
      WHERE customer_id = client_lou_id AND trainer_id = trainer_lou_id
    ) THEN
      -- Complete the payment for Client Lou
      SELECT complete_coach_selection_payment(
        client_lou_id,
        trainer_lou_id,
        'manual'
      ) INTO result;
      
      IF (result->>'success')::boolean THEN
        RAISE NOTICE 'Successfully created payment package for Client Lou: %', result;
      ELSE
        RAISE NOTICE 'Failed to create payment package for Client Lou: %', result->>'error';
      END IF;
    ELSE
      RAISE NOTICE 'Payment package already exists for Client Lou';
    END IF;
  ELSE
    RAISE NOTICE 'Could not find Client Lou (%) or Trainer Lou (%)', client_lou_id, trainer_lou_id;
  END IF;
END;
$$;