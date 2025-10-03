-- Fix RLS policies for user_alert_interactions table
-- Drop existing policies first
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can insert own interactions" ON user_alert_interactions;
  DROP POLICY IF EXISTS "Users can view own interactions" ON user_alert_interactions;
  DROP POLICY IF EXISTS "Users can update own interactions" ON user_alert_interactions;
END $$;

-- Enable RLS
ALTER TABLE user_alert_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own interactions
CREATE POLICY "Users can insert own interactions"
ON user_alert_interactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own interactions"
ON user_alert_interactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
ON user_alert_interactions
FOR UPDATE
USING (auth.uid() = user_id);