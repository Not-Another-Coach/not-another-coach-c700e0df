-- Make target_user_id nullable in admin_actions_log for system-wide actions
ALTER TABLE admin_actions_log 
ALTER COLUMN target_user_id DROP NOT NULL;