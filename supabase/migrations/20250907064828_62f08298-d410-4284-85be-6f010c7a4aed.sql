-- Add acknowledgment functionality to user_alert_interactions table
-- This allows users to acknowledge activities in the live activity feed

-- First, add acknowledgment-specific columns to user_alert_interactions
ALTER TABLE user_alert_interactions 
ADD COLUMN IF NOT EXISTS acknowledged_at timestamp with time zone DEFAULT null,
ADD COLUMN IF NOT EXISTS acknowledgment_note text DEFAULT null;

-- Create function to acknowledge activities
CREATE OR REPLACE FUNCTION acknowledge_activity(
  p_alert_id uuid,
  p_note text DEFAULT null
) 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user can see this alert
  IF NOT EXISTS (
    SELECT 1 FROM alerts a 
    WHERE a.id = p_alert_id 
    AND user_in_target_audience(a.target_audience)
  ) THEN
    RAISE EXCEPTION 'Alert not found or access denied';
  END IF;
  
  -- Insert or update acknowledgment
  INSERT INTO user_alert_interactions (
    user_id, 
    alert_id, 
    interaction_type, 
    acknowledged_at, 
    acknowledgment_note
  )
  VALUES (
    auth.uid(), 
    p_alert_id, 
    'acknowledged', 
    now(), 
    p_note
  )
  ON CONFLICT (user_id, alert_id, interaction_type)
  DO UPDATE SET 
    acknowledged_at = now(),
    acknowledgment_note = EXCLUDED.acknowledgment_note;
    
  RETURN true;
END;
$$;

-- Create function to check if activity is acknowledged by current user
CREATE OR REPLACE FUNCTION is_activity_acknowledged(p_alert_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_alert_interactions 
    WHERE user_id = auth.uid() 
    AND alert_id = p_alert_id 
    AND interaction_type = 'acknowledged'
    AND acknowledged_at IS NOT NULL
  );
$$;