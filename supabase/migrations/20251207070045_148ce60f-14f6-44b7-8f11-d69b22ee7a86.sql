-- Fix security definer view issue for v_trainers
ALTER VIEW v_trainers SET (security_invoker = true);