-- Remove all constraints from the table and recreate cleanly
ALTER TABLE user_alert_interactions DROP CONSTRAINT IF EXISTS user_alert_interactions_interaction_type_check;

-- First, let's see what we have
SELECT interaction_type, COUNT(*) FROM user_alert_interactions GROUP BY interaction_type;

-- Update all 'acknowledged' to 'read'
UPDATE user_alert_interactions SET interaction_type = 'read' WHERE interaction_type = 'acknowledged';

-- Ensure we don't have any unexpected values - update any other values to 'read' as fallback
UPDATE user_alert_interactions SET interaction_type = 'read' WHERE interaction_type NOT IN ('viewed', 'dismissed', 'read', 'clicked');