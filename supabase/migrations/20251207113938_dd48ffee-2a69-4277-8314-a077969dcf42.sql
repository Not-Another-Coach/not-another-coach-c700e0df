-- Fix security definer view by setting security_invoker = true
ALTER VIEW public.v_trainers SET (security_invoker = true);