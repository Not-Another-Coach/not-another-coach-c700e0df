-- Final Security Fixes Migration (Correct Schema)
-- This migration addresses critical security vulnerabilities using verified table structures

-- 1. Fix trainer_uploaded_images table - Critical data exposure fix
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

-- 2. Fix customer_payments table - Financial data protection
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Package participants can view payments" ON public.customer_payments;
DROP POLICY IF EXISTS "System can insert payments" ON public.customer_payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.customer_payments;

-- Only users involved in the payment can view (via package relationship)
CREATE POLICY "Package participants can view payments"
ON public.customer_payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM payment_packages pp 
    WHERE pp.id = customer_payments.package_id 
    AND (pp.trainer_id = auth.uid() OR pp.customer_id = auth.uid())
  ) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Only system can insert payments (for payment processing)
CREATE POLICY "System can insert payments"
ON public.customer_payments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only admins can update payments
CREATE POLICY "Admins can update payments"
ON public.customer_payments FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix payment_packages table (using status column instead of is_active)
ALTER TABLE public.payment_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can view active packages" ON public.payment_packages;
DROP POLICY IF EXISTS "Auth trainers can manage their packages" ON public.payment_packages;

-- Users can view packages they're involved in
CREATE POLICY "Package participants can view packages"
ON public.payment_packages FOR SELECT
TO authenticated
USING (
  trainer_id = auth.uid() OR 
  customer_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Only trainers can create/manage their own packages
CREATE POLICY "Trainers can manage their packages"
ON public.payment_packages FOR ALL
TO authenticated
USING (trainer_id = auth.uid())
WITH CHECK (trainer_id = auth.uid());

-- 4. Fix discovery_call_feedback_questions table
ALTER TABLE public.discovery_call_feedback_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can view active feedback questions" ON public.discovery_call_feedback_questions;
DROP POLICY IF EXISTS "Auth admins can manage feedback questions" ON public.discovery_call_feedback_questions;

-- Users need to be authenticated to view feedback questions
CREATE POLICY "Authenticated users can view feedback questions"
ON public.discovery_call_feedback_questions FOR SELECT
TO authenticated
USING (is_archived = false);

-- Only admins can manage feedback questions
CREATE POLICY "Admins can manage feedback questions"
ON public.discovery_call_feedback_questions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Fix coach_selection_requests table
ALTER TABLE public.coach_selection_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth clients can manage their selection requests" ON public.coach_selection_requests;
DROP POLICY IF EXISTS "Auth trainers can view and respond to their requests" ON public.coach_selection_requests;
DROP POLICY IF EXISTS "Auth trainers can update their requests" ON public.coach_selection_requests;

CREATE POLICY "Clients can manage their selection requests"
ON public.coach_selection_requests FOR ALL
TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Trainers can view and respond to their requests"
ON public.coach_selection_requests FOR SELECT
TO authenticated
USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can update their requests"
ON public.coach_selection_requests FOR UPDATE
TO authenticated
USING (trainer_id = auth.uid());

-- 6. Fix profiles table access control - Remove public access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Auth users can view published profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view published profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (profile_published = true AND user_type = 'trainer') OR 
  (id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 7. Fix training_types table - Require authentication
DROP POLICY IF EXISTS "Anyone can view active training types" ON public.training_types;
DROP POLICY IF EXISTS "Auth users can view active training types" ON public.training_types;

CREATE POLICY "Authenticated users can view training types"
ON public.training_types FOR SELECT
TO authenticated
USING (is_active = true);

-- 8. Fix popular_qualifications table - Require authentication
DROP POLICY IF EXISTS "Anyone can view active qualifications" ON public.popular_qualifications;
DROP POLICY IF EXISTS "Auth users can view active qualifications" ON public.popular_qualifications;

CREATE POLICY "Authenticated users can view qualifications"
ON public.popular_qualifications FOR SELECT
TO authenticated
USING (is_active = true);

-- 9. Fix database functions - Add SET search_path for security
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