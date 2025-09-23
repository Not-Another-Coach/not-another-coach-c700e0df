-- Clean up trainer-specific visibility functions and tables
-- Remove any trainer-specific initialization triggers and functions

DROP TRIGGER IF EXISTS trigger_auto_initialize_trainer_visibility ON profiles;
DROP FUNCTION IF EXISTS auto_initialize_trainer_visibility();
DROP FUNCTION IF EXISTS initialize_trainer_visibility_defaults(uuid);
DROP FUNCTION IF EXISTS get_content_visibility(uuid, content_type, engagement_stage);
DROP FUNCTION IF EXISTS get_content_visibility_by_group(uuid, content_type, engagement_stage_group);
DROP FUNCTION IF EXISTS update_visibility_for_group(uuid, content_type, engagement_stage_group, visibility_state);

-- Drop trainer-specific visibility tables if they exist
DROP TABLE IF EXISTS trainer_visibility_matrix CASCADE;
DROP TABLE IF EXISTS trainer_visibility_settings CASCADE;

-- The system now relies purely on system_visibility_defaults table
-- which is managed by admins and accessed via VisibilityConfigService