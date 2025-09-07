-- Critical Security Fixes Migration (Corrected)
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

-- Fix discovery_call_settings table - restrict to trainer owners (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discovery_call_settings' AND table_schema = 'public') THEN
    ALTER TABLE public.discovery_call_settings ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Trainers can manage their discovery call settings" ON public.discovery_call_settings;
    CREATE POLICY "Trainers can manage their discovery call settings"
    ON public.discovery_call_settings FOR ALL
    TO authenticated
    USING (trainer_id = auth.uid())
    WITH CHECK (trainer_id = auth.uid());
  END IF;
END $$;

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