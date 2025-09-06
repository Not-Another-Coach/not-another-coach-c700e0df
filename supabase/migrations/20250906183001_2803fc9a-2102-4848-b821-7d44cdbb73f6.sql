-- Fix admin_update_verification_check function to remove net schema dependency
DROP FUNCTION IF EXISTS admin_update_verification_check(UUID, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION admin_update_verification_check(
  p_trainer_id UUID,
  p_check_type TEXT,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_check_id UUID;
  v_trainer_email TEXT;
  v_trainer_name TEXT;
BEGIN
  -- Get the current admin user ID
  v_admin_id := auth.uid();
  
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = v_admin_id AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Get trainer details for notifications
  SELECT email, CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))
  INTO v_trainer_email, v_trainer_name
  FROM auth.users au
  JOIN profiles p ON au.id = p.id
  WHERE au.id = p_trainer_id;

  -- Update the verification check
  UPDATE trainer_verification_checks
  SET 
    status = p_status::verification_status,
    verified_by = v_admin_id,
    verified_at = NOW(),
    admin_notes = p_admin_notes,
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    updated_at = NOW()
  WHERE trainer_id = p_trainer_id 
    AND check_type = p_check_type::verification_check_type
  RETURNING id INTO v_check_id;

  -- Log the admin action
  INSERT INTO trainer_verification_audit_log (
    trainer_id,
    check_type,
    action,
    old_status,
    new_status,
    performed_by,
    notes,
    created_at
  ) VALUES (
    p_trainer_id,
    p_check_type::verification_check_type,
    CASE 
      WHEN p_status = 'verified' THEN 'approved'
      WHEN p_status = 'rejected' THEN 'rejected'
      ELSE 'updated'
    END,
    'pending',
    p_status::verification_status,
    v_admin_id,
    COALESCE(p_admin_notes, p_rejection_reason),
    NOW()
  );

  -- Update trainer verification overview
  INSERT INTO trainer_verification_overview (trainer_id, display_preference, overall_status, last_computed_at)
  VALUES (
    p_trainer_id,
    'verified_allowed',
    CASE 
      WHEN p_status = 'verified' THEN 'verified'
      ELSE 'not_shown'
    END,
    NOW()
  )
  ON CONFLICT (trainer_id) DO UPDATE SET
    overall_status = CASE 
      WHEN p_status = 'verified' THEN 'verified'
      ELSE 'not_shown'
    END,
    last_computed_at = NOW(),
    updated_at = NOW();

  -- Update profiles table verification status
  UPDATE profiles 
  SET verification_status = CASE 
    WHEN p_status = 'verified' THEN 'verified'
    ELSE 'not_shown'
  END,
  updated_at = NOW()
  WHERE id = p_trainer_id;

  RETURN TRUE;
END;
$$;