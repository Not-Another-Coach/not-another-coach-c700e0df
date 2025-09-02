-- Security Fix Phase 2: Fix remaining critical security issues

-- First, let's find which functions still need search_path fixes
-- Fix any remaining functions that may have been missed
ALTER FUNCTION public.update_trainer_verification_status(uuid, verification_status_enum, text, text) SET search_path TO 'public';
ALTER FUNCTION public.calculate_business_due_date(timestamp with time zone, integer) SET search_path TO 'public';
ALTER FUNCTION public.admin_cleanup_client_trainer_interactions(uuid, uuid) SET search_path TO 'public';

-- Create a secure function to replace any potential security definer views
-- This function can be used to safely query data that might be in security definer views
CREATE OR REPLACE FUNCTION public.get_secure_profile_data(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  email text,
  first_name text,
  last_name text,
  user_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow users to see their own data or admins to see all data
  IF p_user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    au.email,
    p.first_name,
    p.last_name,
    p.user_type::text
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.id = p_user_id;
END;
$$;

-- Create a function to handle complete coach selection payment securely
CREATE OR REPLACE FUNCTION public.complete_coach_selection_payment(
  p_client_id uuid,
  p_trainer_id uuid,
  p_payment_method text DEFAULT 'manual'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_package_id text;
  v_payment_id uuid;
  v_result jsonb;
BEGIN
  -- Only allow the client themselves or admins to complete payments
  IF p_client_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only the client or admin can complete payment';
  END IF;

  -- Generate a package ID and payment ID
  v_package_id := 'pkg_' || substr(md5(random()::text), 1, 8);
  v_payment_id := gen_random_uuid();

  -- Update engagement stage to active_client
  PERFORM update_engagement_stage(p_client_id, p_trainer_id, 'active_client'::engagement_stage);

  -- Create a mock payment record (in a real system this would integrate with payment processor)
  INSERT INTO coach_selection_requests (
    client_id,
    trainer_id,
    package_id,
    package_name,
    status,
    correlation_id
  ) VALUES (
    p_client_id,
    p_trainer_id,
    v_package_id,
    'Manual Payment Package',
    'accepted',
    v_payment_id
  ) ON CONFLICT (client_id, trainer_id) 
  DO UPDATE SET 
    status = 'accepted',
    updated_at = now();

  -- Return success response
  v_result := jsonb_build_object(
    'success', true,
    'package_id', v_package_id,
    'payment_id', v_payment_id
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;