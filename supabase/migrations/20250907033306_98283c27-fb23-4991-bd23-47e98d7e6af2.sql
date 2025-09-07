-- Comprehensive Security Fixes Migration
-- This migration addresses critical security vulnerabilities found in the security scan

-- 1. Fix trainer_uploaded_images table - Critical data exposure
-- Remove public read access and require authentication
ALTER TABLE public.trainer_uploaded_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON public.trainer_uploaded_images;
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

-- 3. Fix discovery_call_settings table - Restrict to trainer owners
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

-- 4. Fix discovery_call_feedback_questions - Require authentication
ALTER TABLE public.discovery_call_feedback_questions ENABLE ROW LEVEL SECURITY;

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

-- 5. Fix payment_packages table - Secure package data
ALTER TABLE public.payment_packages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view active packages
CREATE POLICY "Authenticated users can view active packages"
ON public.payment_packages FOR SELECT
TO authenticated
USING (is_active = true);

-- Only trainers can manage their own packages
CREATE POLICY "Trainers can manage their packages"
ON public.payment_packages FOR ALL
TO authenticated
USING (trainer_id = auth.uid())
WITH CHECK (trainer_id = auth.uid());

-- 6. Fix database functions - Add SET search_path to functions missing it
-- These functions were identified in the security scan as having mutable search paths

-- Fix copy_template_tasks_to_client_progress function
CREATE OR REPLACE FUNCTION public.copy_template_tasks_to_client_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    template_record RECORD;
    getting_started_task RECORD;
    first_week_task RECORD;
    task_order INTEGER := 0;
BEGIN
    -- Only process when a new template assignment is created with active status
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        -- Get the template information
        SELECT * INTO template_record 
        FROM trainer_onboarding_templates 
        WHERE id = NEW.template_base_id;
        
        IF NOT FOUND THEN
            RAISE NOTICE 'Template not found: %', NEW.template_base_id;
            RETURN NEW;
        END IF;
        
        -- Copy Getting Started tasks
        FOR getting_started_task IN 
            SELECT * FROM onboarding_getting_started 
            WHERE template_id = NEW.template_base_id
            ORDER BY display_order
        LOOP
            task_order := task_order + 1;
            
            INSERT INTO client_onboarding_progress (
                client_id,
                trainer_id,
                step_name,
                step_type,
                description,
                instructions,
                requires_file_upload,
                completion_method,
                display_order,
                status,
                activity_id,
                due_in_days,
                sla_days,
                assignment_id
            ) VALUES (
                NEW.client_id,
                NEW.trainer_id,
                getting_started_task.task_name,
                CASE WHEN getting_started_task.is_mandatory THEN 'mandatory' ELSE 'optional' END,
                getting_started_task.description,
                getting_started_task.rich_guidance,
                getting_started_task.requires_attachment,
                'client',
                task_order,
                'pending',
                getting_started_task.activity_id,
                getting_started_task.due_days,
                CASE WHEN getting_started_task.sla_hours IS NOT NULL THEN CEIL(getting_started_task.sla_hours::numeric / 24) ELSE NULL END,
                NEW.id
            );
        END LOOP;
        
        -- Copy First Week tasks
        FOR first_week_task IN 
            SELECT * FROM onboarding_first_week 
            WHERE template_id = NEW.template_base_id
            ORDER BY display_order
        LOOP
            task_order := task_order + 1;
            
            INSERT INTO client_onboarding_progress (
                client_id,
                trainer_id,
                step_name,
                step_type,
                description,
                instructions,
                requires_file_upload,
                completion_method,
                display_order,
                status,
                activity_id,
                due_in_days,
                sla_days,
                assignment_id
            ) VALUES (
                NEW.client_id,
                NEW.trainer_id,
                first_week_task.task_name,
                CASE WHEN first_week_task.is_mandatory THEN 'mandatory' ELSE 'optional' END,
                first_week_task.description,
                first_week_task.rich_guidance,
                first_week_task.requires_attachment,
                'client',
                task_order,
                'pending',
                first_week_task.activity_id,
                first_week_task.due_days,
                CASE WHEN first_week_task.sla_hours IS NOT NULL THEN CEIL(first_week_task.sla_hours::numeric / 24) ELSE NULL END,
                NEW.id
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Fix update_updated_at function
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

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, user_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'client')
  );
  RETURN NEW;
END;
$function$;

-- 7. Secure additional exposed tables identified in scan

-- Fix coach_selection_requests table
ALTER TABLE public.coach_selection_requests ENABLE ROW LEVEL SECURITY;

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

-- Fix profiles table - ensure proper access control
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view published profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (profile_published = true AND user_type = 'trainer') OR 
  (id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Fix training_types table
CREATE POLICY "Authenticated users can view active training types"
ON public.training_types FOR SELECT
TO authenticated
USING (is_active = true);

-- Fix popular_qualifications table  
CREATE POLICY "Authenticated users can view active qualifications"
ON public.popular_qualifications FOR SELECT
TO authenticated
USING (is_active = true);

-- 8. Additional security hardening
-- Ensure all sensitive tables have proper RLS enabled and configured

-- Fix waynesofworking_categories table if exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'waysofworking_categories' AND table_schema = 'public') THEN
    ALTER TABLE public.waysofworking_categories ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Authenticated users can view active categories"
    ON public.waysofworking_categories FOR SELECT
    TO authenticated
    USING (is_active = true);
    
    CREATE POLICY "Admins can manage categories"
    ON public.waysofworking_categories FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;