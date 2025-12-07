-- Fix security definer view issue by setting security_invoker = true
ALTER VIEW v_clients SET (security_invoker = true);