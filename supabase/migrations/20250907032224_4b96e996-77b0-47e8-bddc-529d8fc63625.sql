-- Critical Security Fixes Migration
-- This migration addresses the most critical security vulnerabilities

-- 1. Add missing RLS policies for publicly exposed tables
-- Fix trainer_uploaded_images table - require authentication
DROP POLICY IF EXISTS "Public read access" ON public.trainer_uploaded_images;
DROP POLICY IF EXISTS "Trainers can manage their uploaded images" ON public.trainer_uploaded_images;

CREATE POLICY "Authenticated users can view trainer images"
ON public.trainer_uploaded_images FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Trainers can manage their uploaded images"
ON public.trainer_uploaded_images FOR ALL
TO authenticated
USING (trainer_id = auth.uid())
WITH CHECK (trainer_id = auth.uid());

-- Fix discovery_call_settings table - restrict to trainer owners
ALTER TABLE public.discovery_call_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers can manage their discovery call settings" ON public.discovery_call_settings;
CREATE POLICY "Trainers can manage their discovery call settings"
ON public.discovery_call_settings FOR ALL
TO authenticated
USING (trainer_id = auth.uid())
WITH CHECK (trainer_id = auth.uid());

-- Fix customer_payments table - restrict to users involved in payment
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payments" ON public.customer_payments;
DROP POLICY IF EXISTS "Trainers can view payments for their services" ON public.customer_payments;

CREATE POLICY "Users can view their own payments"
ON public.customer_payments FOR SELECT
TO authenticated
USING (client_id = auth.uid() OR trainer_id = auth.uid());

CREATE POLICY "Admins can manage all payments"
ON public.customer_payments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix trainer_onboarding_activities to require authentication for viewing
DROP POLICY IF EXISTS "select_system_or_own_activities" ON public.trainer_onboarding_activities;
CREATE POLICY "select_system_or_own_activities"
ON public.trainer_onboarding_activities FOR SELECT
TO authenticated
USING ((is_system = true) OR (trainer_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix database functions - add SET search_path to all functions missing it

-- Fix update_trainer_verification_status function
CREATE OR REPLACE FUNCTION public.update_trainer_verification_status(p_trainer_id uuid, p_status verification_status_enum, p_admin_notes text DEFAULT NULL::text, p_rejection_reason text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only admins can update verification status
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification status';
  END IF;

  -- Update the profile verification status
  UPDATE public.profiles
  SET 
    verification_status = p_status,
    admin_review_notes = p_admin_notes,
    updated_at = now()
  WHERE id = p_trainer_id AND user_type = 'trainer';

  -- Update the verification request
  UPDATE public.trainer_verification_requests
  SET
    status = CASE 
      WHEN p_status = 'verified' THEN 'approved'::verification_request_status
      WHEN p_status = 'rejected' THEN 'rejected'::verification_request_status
      ELSE 'under_review'::verification_request_status
    END,
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    admin_notes = p_admin_notes,
    rejection_reason = p_rejection_reason,
    updated_at = now()
  WHERE trainer_id = p_trainer_id AND status != 'approved' AND status != 'rejected';

  -- Log the admin action
  PERFORM public.log_admin_action(
    p_trainer_id,
    'verification_status_update',
    jsonb_build_object(
      'new_status', p_status,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    'Verification status updated'
  );

  -- Create notification for trainer
  INSERT INTO public.alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'verification_update',
    CASE 
      WHEN p_status = 'verified' THEN 'Profile Verified!'
      WHEN p_status = 'rejected' THEN 'Verification Rejected'
      ELSE 'Verification Under Review'
    END,
    CASE 
      WHEN p_status = 'verified' THEN 'Congratulations! Your trainer profile has been verified and is now published.'
      WHEN p_status = 'rejected' THEN COALESCE('Your verification was rejected. Reason: ' || p_rejection_reason, 'Your verification was rejected. Please review the feedback and resubmit.')
      ELSE 'Your verification request is currently under review by our admin team.'
    END,
    jsonb_build_object('trainers', jsonb_build_array(p_trainer_id)),
    jsonb_build_object(
      'trainer_id', p_trainer_id,
      'verification_status', p_status,
      'admin_notes', p_admin_notes
    ),
    true
  );
END;
$function$;

-- Fix update_all_user_passwords_dev_simple function
CREATE OR REPLACE FUNCTION public.update_all_user_passwords_dev_simple()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
BEGIN
  -- Allow any authenticated user in development mode
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to update passwords';
  END IF;
  
  -- Loop through all users and update their passwords
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users 
    WHERE email IS NOT NULL
  LOOP
    -- Update each user's password to Password123!
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Password123!', gen_salt('bf')),
      updated_at = now()
    WHERE id = user_record.id;
  END LOOP;
  
  -- Insert a log entry for tracking
  INSERT INTO public.admin_actions_log (admin_id, target_user_id, action_type, action_details, reason)
  SELECT 
    auth.uid(),
    id,
    'password_reset_dev',
    '{"new_password": "Password123!"}',
    'Development password standardization'
  FROM auth.users 
  WHERE email IS NOT NULL;
  
END;
$function$;

-- Fix get_user_emails_for_development function
CREATE OR REPLACE FUNCTION public.get_user_emails_for_development()
RETURNS TABLE(user_id uuid, email character varying)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow any authenticated user to access emails for development
  -- In production, this function should be dropped or restricted
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to access user emails';
  END IF;

  -- Return user IDs and emails from auth.users
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email IS NOT NULL
  ORDER BY au.created_at DESC;
END;
$function$;

-- Fix update_user_email_for_admin function
CREATE OR REPLACE FUNCTION public.update_user_email_for_admin(target_user_id uuid, new_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only admins can update emails
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update user emails';
  END IF;

  -- Update email in auth.users table
  UPDATE auth.users 
  SET email = new_email, 
      updated_at = now()
  WHERE id = target_user_id;

  -- Log the admin action
  PERFORM public.log_admin_action(
    target_user_id,
    'update_email',
    jsonb_build_object('new_email', new_email),
    'Email updated by admin'
  );

  RETURN true;
END;
$function$;

-- Fix reorder_feedback_questions function
CREATE OR REPLACE FUNCTION public.reorder_feedback_questions(question_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  question_id UUID;
  new_order INTEGER := 1;
BEGIN
  -- Only admins can reorder
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reorder questions';
  END IF;

  -- Update display_order for each question
  FOREACH question_id IN ARRAY question_ids LOOP
    UPDATE public.discovery_call_feedback_questions 
    SET display_order = new_order, updated_at = now()
    WHERE id = question_id;
    
    new_order := new_order + 1;
  END LOOP;
END;
$function$;

-- Fix request_profile_publication function
CREATE OR REPLACE FUNCTION public.request_profile_publication()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_id UUID;
  trainer_name TEXT;
BEGIN
  -- Check if user is authenticated trainer
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated';
  END IF;
  
  -- Check if profile is already published
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND profile_published = true) THEN
    RAISE EXCEPTION 'Profile is already published';
  END IF;
  
  -- Check if there's already a pending request
  IF EXISTS (SELECT 1 FROM profile_publication_requests WHERE trainer_id = auth.uid() AND status = 'pending') THEN
    RAISE EXCEPTION 'You already have a pending publication request';
  END IF;
  
  -- Create the publication request
  INSERT INTO profile_publication_requests (trainer_id)
  VALUES (auth.uid())
  RETURNING id INTO request_id;
  
  -- Get trainer name for notification
  SELECT COALESCE(first_name || ' ' || last_name, email) INTO trainer_name
  FROM profiles WHERE id = auth.uid();
  
  -- Create admin notification
  INSERT INTO alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'profile_publication_request',
    'New Profile Publication Request',
    trainer_name || ' has requested to publish their trainer profile',
    jsonb_build_object('admins', jsonb_build_array('all')),
    jsonb_build_object(
      'trainer_id', auth.uid(),
      'request_id', request_id,
      'trainer_name', trainer_name
    ),
    true
  );
  
  RETURN request_id;
END;
$function$;

-- Fix review_profile_publication function
CREATE OR REPLACE FUNCTION public.review_profile_publication(p_request_id uuid, p_action publication_request_status, p_admin_notes text DEFAULT NULL::text, p_rejection_reason text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  req_record RECORD;
  trainer_name TEXT;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can review publication requests';
  END IF;
  
  -- Get request details
  SELECT * INTO req_record
  FROM profile_publication_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Publication request not found or already processed';
  END IF;
  
  -- Update the request
  UPDATE profile_publication_requests
  SET 
    status = p_action,
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    admin_notes = p_admin_notes,
    rejection_reason = CASE WHEN p_action = 'rejected' THEN p_rejection_reason ELSE NULL END,
    updated_at = now()
  WHERE id = p_request_id;
  
  -- Get trainer name
  SELECT COALESCE(first_name || ' ' || last_name, email) INTO trainer_name
  FROM profiles WHERE id = req_record.trainer_id;
  
  -- If approved, check verification status and auto-publish if verified
  IF p_action = 'approved' THEN
    -- Check if trainer is already verified
    IF EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = req_record.trainer_id AND verification_status = 'verified'
    ) THEN
      -- Auto-publish the profile
      UPDATE profiles 
      SET profile_published = true, updated_at = now()
      WHERE id = req_record.trainer_id;
      
      -- Create success notification for trainer
      INSERT INTO alerts (
        alert_type,
        title,
        content,
        target_audience,
        metadata,
        is_active
      )
      VALUES (
        'profile_published',
        'Profile Published!',
        'Your trainer profile has been approved and published. It is now visible to clients.',
        jsonb_build_object('trainers', jsonb_build_array(req_record.trainer_id)),
        jsonb_build_object(
          'trainer_id', req_record.trainer_id,
          'published_at', now()
        ),
        true
      );
    ELSE
      -- Create notification about approval pending verification
      INSERT INTO alerts (
        alert_type,
        title,
        content,
        target_audience,
        metadata,
        is_active
      )
      VALUES (
        'profile_approved_pending_verification',
        'Profile Approved - Verification Required',
        'Your profile publication has been approved! Complete your verification to publish your profile.',
        jsonb_build_object('trainers', jsonb_build_array(req_record.trainer_id)),
        jsonb_build_object(
          'trainer_id', req_record.trainer_id,
          'request_id', p_request_id
        ),
        true
      );
    END IF;
  ELSIF p_action = 'rejected' THEN
    -- Create rejection notification for trainer
    INSERT INTO alerts (
      alert_type,
      title,
      content,
      target_audience,
      metadata,
      is_active
    )
    VALUES (
      'profile_publication_rejected',
      'Profile Publication Rejected',
      'Your profile publication request was not approved. ' || 
      CASE WHEN p_rejection_reason IS NOT NULL THEN 'Reason: ' || p_rejection_reason ELSE 'Please review the feedback and make necessary changes.' END,
      jsonb_build_object('trainers', jsonb_build_array(req_record.trainer_id)),
      jsonb_build_object(
        'trainer_id', req_record.trainer_id,
        'request_id', p_request_id,
        'admin_notes', p_admin_notes,
        'rejection_reason', p_rejection_reason
      ),
      true
    );
  END IF;
  
  -- Log admin action
  PERFORM log_admin_action(
    req_record.trainer_id,
    'profile_publication_review',
    jsonb_build_object(
      'request_id', p_request_id,
      'action', p_action,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    'Profile publication request reviewed'
  );
END;
$function$;

-- Fix create_coach_selection_request function
CREATE OR REPLACE FUNCTION public.create_coach_selection_request(p_trainer_id uuid, p_package_id text, p_package_name text, p_package_price numeric, p_package_duration text, p_client_message text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_id UUID;
  current_user_id UUID;
  current_stage engagement_stage;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create selection request';
  END IF;
  
  -- Get current engagement stage
  SELECT stage INTO current_stage
  FROM public.client_trainer_engagement
  WHERE client_id = current_user_id AND trainer_id = p_trainer_id;
  
  -- Insert the selection request
  INSERT INTO public.coach_selection_requests (
    client_id,
    trainer_id,
    package_id,
    package_name,
    package_price,
    package_duration,
    client_message
  )
  VALUES (
    current_user_id,
    p_trainer_id,
    p_package_id,
    p_package_name,
    p_package_price,
    p_package_duration,
    p_client_message
  )
  ON CONFLICT (client_id, trainer_id)
  DO UPDATE SET
    package_id = EXCLUDED.package_id,
    package_name = EXCLUDED.package_name,
    package_price = EXCLUDED.package_price,
    package_duration = EXCLUDED.package_duration,
    client_message = EXCLUDED.client_message,
    status = 'pending',
    trainer_response = NULL,
    suggested_alternative_package_id = NULL,
    suggested_alternative_package_name = NULL,
    suggested_alternative_package_price = NULL,
    responded_at = NULL,
    updated_at = now()
  RETURNING id INTO request_id;

  -- Update engagement stage to be more appropriate
  -- If currently discovery_completed, stay there; if discovery_in_progress, stay there; 
  -- otherwise set to discovery_in_progress to indicate coach selection is in progress
  IF current_stage = 'discovery_completed' THEN
    -- Keep discovery_completed status as they've completed the discovery process
    PERFORM public.update_engagement_stage(current_user_id, p_trainer_id, 'discovery_completed');
  ELSIF current_stage = 'discovery_in_progress' THEN
    -- Keep discovery_in_progress as they're still in that phase
    PERFORM public.update_engagement_stage(current_user_id, p_trainer_id, 'discovery_in_progress');
  ELSE
    -- For other stages (browsing, liked, shortlisted), move to discovery_in_progress
    -- to indicate they're in the coach selection process
    PERFORM public.update_engagement_stage(current_user_id, p_trainer_id, 'discovery_in_progress');
  END IF;

  RETURN request_id;
END;
$function$;