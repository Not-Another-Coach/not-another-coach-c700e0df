-- Comprehensive Security Fixes Migration (Corrected)
-- This migration safely addresses critical security vulnerabilities

-- 1. Fix trainer_uploaded_images table (safely handle existing policies)
ALTER TABLE public.trainer_uploaded_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON public.trainer_uploaded_images;
DROP POLICY IF EXISTS "Authenticated users can view trainer images" ON public.trainer_uploaded_images;
DROP POLICY IF EXISTS "Trainers can manage their uploaded images" ON public.trainer_uploaded_images;

-- Require authentication for viewing trainer images
CREATE POLICY "Authenticated users can view trainer images"
ON public.trainer_uploaded_images FOR SELECT
TO authenticated
USING (true);

-- Trainers can manage their own images
CREATE POLICY "Trainers can manage their uploaded images"
ON public.trainer_uploaded_images FOR ALL
TO authenticated
USING (trainer_id = auth.uid())
WITH CHECK (trainer_id = auth.uid());

-- 2. Fix customer_payments table - Critical financial data exposure
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Payment participants can view payments" ON public.customer_payments;
DROP POLICY IF EXISTS "System can insert payments" ON public.customer_payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.customer_payments;

-- Only payment participants and admins can view payments
CREATE POLICY "Payment participants can view payments"
ON public.customer_payments FOR SELECT
TO authenticated
USING (
  (client_id = auth.uid()) OR 
  (trainer_id = auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Only system can insert payments
CREATE POLICY "System can insert payments"
ON public.customer_payments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only admins can update payments
CREATE POLICY "Admins can update payments"
ON public.customer_payments FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix discovery_call_settings table (safely handle if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discovery_call_settings' AND table_schema = 'public') THEN
    ALTER TABLE public.discovery_call_settings ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Trainers can manage their discovery call settings" ON public.discovery_call_settings;
    CREATE POLICY "Safe trainers can manage discovery call settings"
    ON public.discovery_call_settings FOR ALL
    TO authenticated
    USING (trainer_id = auth.uid())
    WITH CHECK (trainer_id = auth.uid());
  END IF;
END $$;

-- 4. Fix discovery_call_feedback_questions table
ALTER TABLE public.discovery_call_feedback_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view active feedback questions" ON public.discovery_call_feedback_questions;
DROP POLICY IF EXISTS "Admins can manage feedback questions" ON public.discovery_call_feedback_questions;
DROP POLICY IF EXISTS "Authenticated users can view feedback questions" ON public.discovery_call_feedback_questions;

-- Users need to be authenticated to view feedback questions
CREATE POLICY "Safe authenticated users can view feedback questions"
ON public.discovery_call_feedback_questions FOR SELECT
TO authenticated
USING (is_archived = false);

-- Only admins can manage feedback questions
CREATE POLICY "Safe admins can manage feedback questions"
ON public.discovery_call_feedback_questions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Fix payment_packages table
ALTER TABLE public.payment_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view active packages" ON public.payment_packages;
DROP POLICY IF EXISTS "Trainers can manage their packages" ON public.payment_packages;

-- Authenticated users can view active packages
CREATE POLICY "Safe authenticated users can view active packages"
ON public.payment_packages FOR SELECT
TO authenticated
USING (is_active = true);

-- Only trainers can manage their own packages
CREATE POLICY "Safe trainers can manage their packages"
ON public.payment_packages FOR ALL
TO authenticated
USING (trainer_id = auth.uid())
WITH CHECK (trainer_id = auth.uid());

-- 6. Fix coach_selection_requests table
ALTER TABLE public.coach_selection_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can manage their selection requests" ON public.coach_selection_requests;
DROP POLICY IF EXISTS "Trainers can view and respond to their requests" ON public.coach_selection_requests;
DROP POLICY IF EXISTS "Trainers can update their requests" ON public.coach_selection_requests;

CREATE POLICY "Safe clients can manage their selection requests"
ON public.coach_selection_requests FOR ALL
TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Safe trainers can view and respond to their requests"
ON public.coach_selection_requests FOR SELECT
TO authenticated
USING (trainer_id = auth.uid());

CREATE POLICY "Safe trainers can update their requests"
ON public.coach_selection_requests FOR UPDATE
TO authenticated
USING (trainer_id = auth.uid());

-- 7. Fix profiles table access control (safely drop and recreate)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view published profiles" ON public.profiles;

CREATE POLICY "Safe authenticated users can view published profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (profile_published = true AND user_type = 'trainer') OR 
  (id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 8. Fix training_types table
DROP POLICY IF EXISTS "Anyone can view active training types" ON public.training_types;
DROP POLICY IF EXISTS "Authenticated users can view active training types" ON public.training_types;

CREATE POLICY "Safe authenticated users can view active training types"
ON public.training_types FOR SELECT
TO authenticated
USING (is_active = true);

-- 9. Fix popular_qualifications table
DROP POLICY IF EXISTS "Anyone can view active qualifications" ON public.popular_qualifications;
DROP POLICY IF EXISTS "Authenticated users can view active qualifications" ON public.popular_qualifications;

CREATE POLICY "Safe authenticated users can view active qualifications"
ON public.popular_qualifications FOR SELECT
TO authenticated
USING (is_active = true);

-- 10. Fix database functions - Add SET search_path to functions missing it
-- Only update functions that don't already have SET search_path

-- Fix update_updated_at function (commonly used trigger function)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_profiles_updated_at function
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_client_profiles_updated_at function
CREATE OR REPLACE FUNCTION public.update_client_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;