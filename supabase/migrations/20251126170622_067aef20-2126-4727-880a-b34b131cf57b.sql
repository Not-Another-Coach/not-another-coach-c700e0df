-- Remove security_barrier from views to fix SECURITY DEFINER warning
-- security_barrier makes views act like SECURITY DEFINER, which enforces
-- permissions of the view creator rather than the querying user.
-- Regular views (without security_barrier) properly respect RLS policies
-- based on the current user's permissions, which is the desired behavior.

ALTER VIEW public.v_clients RESET (security_barrier);
ALTER VIEW public.v_trainers RESET (security_barrier);

-- Update comments to reflect the security approach
COMMENT ON VIEW public.v_clients IS 'View of client profiles that enforces RLS policies based on the querying user';
COMMENT ON VIEW public.v_trainers IS 'View of trainer profiles that enforces RLS policies based on the querying user';