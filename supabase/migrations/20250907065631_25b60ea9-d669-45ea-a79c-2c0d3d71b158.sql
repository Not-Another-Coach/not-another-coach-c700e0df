-- First check what interaction types exist
SELECT DISTINCT interaction_type FROM user_alert_interactions;

-- Update any remaining 'acknowledged' to 'read' 
UPDATE user_alert_interactions 
SET interaction_type = 'read' 
WHERE interaction_type = 'acknowledged';

-- Now safely add the constraint
ALTER TABLE user_alert_interactions DROP CONSTRAINT IF EXISTS user_alert_interactions_interaction_type_check;

ALTER TABLE user_alert_interactions 
ADD CONSTRAINT user_alert_interactions_interaction_type_check 
CHECK (interaction_type IN ('viewed', 'dismissed', 'read', 'clicked'));