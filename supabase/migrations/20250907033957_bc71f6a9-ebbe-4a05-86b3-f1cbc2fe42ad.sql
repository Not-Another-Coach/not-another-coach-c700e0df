-- Security Fixes Migration - Final Attempt with Unique Names
-- This migration uses unique policy names to avoid conflicts

-- 1. Fix trainer_uploaded_images table 
ALTER TABLE public.trainer_uploaded_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON public.trainer_uploaded_images;
DROP POLICY IF EXISTS "Authenticated users can view trainer images" ON public.trainer_uploaded_images;
DROP POLICY IF EXISTS "Trainers can manage their uploaded images" ON public.trainer_uploaded_images;

CREATE POLICY "secure_view_trainer_images_2025"
ON public.trainer_uploaded_images FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "secure_manage_trainer_images_2025"
ON public.trainer_uploaded_images FOR ALL
TO authenticated
USING (trainer_id = auth.uid())
WITH CHECK (trainer_id = auth.uid());

-- 2. Fix customer_payments table
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Package participants can view payments" ON public.customer_payments;
DROP POLICY IF EXISTS "System can insert payments" ON public.customer_payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.customer_payments;

CREATE POLICY "secure_view_payments_2025"
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

CREATE POLICY "secure_insert_payments_2025"
ON public.customer_payments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "secure_update_payments_2025"
ON public.customer_payments FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix payment_packages table
ALTER TABLE public.payment_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Package participants can view packages" ON public.payment_packages;
DROP POLICY IF EXISTS "Trainers can manage their packages" ON public.payment_packages;

CREATE POLICY "secure_view_packages_2025"
ON public.payment_packages FOR SELECT
TO authenticated
USING (
  trainer_id = auth.uid() OR 
  customer_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "secure_manage_packages_2025"
ON public.payment_packages FOR ALL
TO authenticated
USING (trainer_id = auth.uid())
WITH CHECK (trainer_id = auth.uid());

-- 4. Fix discovery_call_feedback_questions table
ALTER TABLE public.discovery_call_feedback_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view active feedback questions" ON public.discovery_call_feedback_questions;
DROP POLICY IF EXISTS "Admins can manage feedback questions" ON public.discovery_call_feedback_questions;
DROP POLICY IF EXISTS "Authenticated users can view feedback questions" ON public.discovery_call_feedback_questions;

CREATE POLICY "secure_view_feedback_questions_2025"
ON public.discovery_call_feedback_questions FOR SELECT
TO authenticated
USING (is_archived = false);

CREATE POLICY "secure_manage_feedback_questions_2025"
ON public.discovery_call_feedback_questions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Fix coach_selection_requests table
ALTER TABLE public.coach_selection_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can manage their selection requests" ON public.coach_selection_requests;
DROP POLICY IF EXISTS "Trainers can view and respond to their requests" ON public.coach_selection_requests;
DROP POLICY IF EXISTS "Trainers can update their requests" ON public.coach_selection_requests;

CREATE POLICY "secure_client_selection_requests_2025"
ON public.coach_selection_requests FOR ALL
TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

CREATE POLICY "secure_trainer_view_requests_2025"
ON public.coach_selection_requests FOR SELECT
TO authenticated
USING (trainer_id = auth.uid());

CREATE POLICY "secure_trainer_update_requests_2025"
ON public.coach_selection_requests FOR UPDATE
TO authenticated
USING (trainer_id = auth.uid());

-- 6. Fix profiles table - Remove public access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view published profiles" ON public.profiles;

CREATE POLICY "secure_view_profiles_2025"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (profile_published = true AND user_type = 'trainer') OR 
  (id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 7. Fix training_types table
DROP POLICY IF EXISTS "Anyone can view active training types" ON public.training_types;
DROP POLICY IF EXISTS "Authenticated users can view training types" ON public.training_types;

CREATE POLICY "secure_view_training_types_2025"
ON public.training_types FOR SELECT
TO authenticated
USING (is_active = true);

-- 8. Fix popular_qualifications table
DROP POLICY IF EXISTS "Anyone can view active qualifications" ON public.popular_qualifications;
DROP POLICY IF EXISTS "Authenticated users can view qualifications" ON public.popular_qualifications;

CREATE POLICY "secure_view_qualifications_2025"
ON public.popular_qualifications FOR SELECT
TO authenticated
USING (is_active = true);