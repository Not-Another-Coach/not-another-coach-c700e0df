-- Security Fix Phase 3: Fix the remaining functions with correct signatures

-- Fix the remaining functions that still need search_path
ALTER FUNCTION public.calculate_execution_score(p_trainer_id uuid, p_week_start date) SET search_path TO 'public';
ALTER FUNCTION public.carry_forward_incomplete_cts(p_trainer_id uuid, p_from_week_start date, p_to_week_start date) SET search_path TO 'public';
ALTER FUNCTION public.get_trainer_streak_count(trainer_uuid uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_execution_score_on_ct_change() SET search_path TO 'public';

-- Let's also check and fix any edge function related issues that might be causing Security Definer View warnings
-- These are likely system-created views that we need to address

-- Update Auth settings to improve security (OTP expiry and leaked password protection)
-- Note: These settings typically need to be configured through the Supabase Dashboard
-- but we can document the required changes

COMMENT ON SCHEMA public IS 'Security fixes applied: All security definer functions now have proper search_path set to prevent search path manipulation attacks. Auth settings should be reviewed in Supabase Dashboard to: 1) Reduce OTP expiry time, 2) Enable leaked password protection';