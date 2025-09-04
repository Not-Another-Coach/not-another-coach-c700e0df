-- Remove foreign key constraint on target_user_id to allow logging actions on deleted users
ALTER TABLE public.admin_actions_log 
DROP CONSTRAINT IF EXISTS admin_actions_log_target_user_id_fkey;

-- Add a comment to document why this constraint was removed
COMMENT ON COLUMN public.admin_actions_log.target_user_id IS 'References user ID - no foreign key constraint to allow logging actions on deleted users';