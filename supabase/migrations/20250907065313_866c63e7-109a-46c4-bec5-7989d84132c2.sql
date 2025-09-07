-- Fix the interaction_type check constraint to allow 'acknowledged' value
ALTER TABLE user_alert_interactions DROP CONSTRAINT IF EXISTS user_alert_interactions_interaction_type_check;

ALTER TABLE user_alert_interactions 
ADD CONSTRAINT user_alert_interactions_interaction_type_check 
CHECK (interaction_type IN ('viewed', 'dismissed', 'acknowledged', 'clicked'));