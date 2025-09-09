-- Security Fix: Add SET search_path TO 'public' to functions missing this protection
-- This prevents SQL injection attacks by ensuring consistent schema search paths

-- Fix get_week_end function
CREATE OR REPLACE FUNCTION public.get_week_end(input_date date)
RETURNS date
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT (input_date + INTERVAL '6 days' - INTERVAL '1 day' * EXTRACT(DOW FROM input_date)::integer)::date;
$$;

-- Fix get_week_start function  
CREATE OR REPLACE FUNCTION public.get_week_start(input_date date)
RETURNS date
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT (input_date - INTERVAL '1 day' * EXTRACT(DOW FROM input_date)::integer)::date;
$$;

-- Fix set_ct_week_start function
CREATE OR REPLACE FUNCTION public.set_ct_week_start()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Set week_start to the Monday of the current week for the due_date
  NEW.week_start := (NEW.due_date - INTERVAL '1 day' * EXTRACT(DOW FROM NEW.due_date)::integer)::date;
  RETURN NEW;
END;
$$;

-- Fix update_app_settings_updated_at function
CREATE OR REPLACE FUNCTION public.update_app_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_highlights_content_updated_at function
CREATE OR REPLACE FUNCTION public.update_highlights_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_highlights_submissions_updated_at function
CREATE OR REPLACE FUNCTION public.update_highlights_submissions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_membership_updated_at function
CREATE OR REPLACE FUNCTION public.update_membership_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_payment_updated_at function
CREATE OR REPLACE FUNCTION public.update_payment_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_template_sections_updated_at function
CREATE OR REPLACE FUNCTION public.update_template_sections_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_ways_of_working_categories_updated_at function
CREATE OR REPLACE FUNCTION public.update_ways_of_working_categories_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Note: The 2 critical SECURITY DEFINER issues are in the storage schema 
-- (add_prefixes and delete_prefix functions). These are Supabase built-in
-- functions that cannot be modified directly. They may need to be addressed
-- through Supabase configuration or by contacting Supabase support.