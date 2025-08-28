-- Manually create payment package for Client Lou since her request is already completed
DO $$
DECLARE
  client_lou_id UUID;
  trainer_lou_id UUID;
  lou_request_id UUID;
  v_package_id UUID;
  v_payment_id UUID;
BEGIN
  -- Find Client Lou and Trainer Lou IDs
  SELECT p.id, csr.id INTO client_lou_id, lou_request_id
  FROM public.profiles p
  JOIN coach_selection_requests csr ON csr.client_id = p.id
  WHERE p.first_name ILIKE '%lou%' AND p.user_type = 'client'
  LIMIT 1;

  SELECT id INTO trainer_lou_id 
  FROM public.profiles 
  WHERE first_name ILIKE '%lou%' AND user_type = 'trainer'
  LIMIT 1;

  -- Only proceed if both are found and no payment package exists yet
  IF client_lou_id IS NOT NULL AND trainer_lou_id IS NOT NULL AND lou_request_id IS NOT NULL THEN
    -- Check if payment package already exists
    IF NOT EXISTS (
      SELECT 1 FROM payment_packages 
      WHERE customer_id = client_lou_id AND trainer_id = trainer_lou_id
    ) THEN
      -- Create payment package manually
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
        trainer_lou_id,
        client_lou_id,
        lou_request_id,
        '30 Private PT (Online) (Copy)',
        NOW(),
        4, -- Default to 4 weeks
        'GBP',
        900,
        'GBP',
        900,
        'weekly',
        'upfront',
        'active'
      ) RETURNING id INTO v_package_id;
      
      -- Create customer payment record
      INSERT INTO customer_payments (
        package_id,
        paid_at,
        amount_currency,
        amount_value,
        payment_method,
        status
      ) VALUES (
        v_package_id,
        NOW(),
        'GBP',
        900,
        'manual',
        'succeeded'
      ) RETURNING id INTO v_payment_id;
      
      RAISE NOTICE 'Successfully created payment package % and payment % for Client Lou', v_package_id, v_payment_id;
    ELSE
      RAISE NOTICE 'Payment package already exists for Client Lou';
    END IF;
  ELSE
    RAISE NOTICE 'Could not find required data: Client Lou (%), Trainer Lou (%), Request (%)', client_lou_id, trainer_lou_id, lou_request_id;
  END IF;
END;
$$;