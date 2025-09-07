-- Fix security vulnerability: Convert views from SECURITY DEFINER to SECURITY INVOKER
-- This ensures RLS policies are properly enforced when querying these views

-- Convert v_clients view to use security invoker
ALTER VIEW public.v_clients SET (security_invoker = on);

-- Convert v_trainers view to use security invoker  
ALTER VIEW public.v_trainers SET (security_invoker = on);