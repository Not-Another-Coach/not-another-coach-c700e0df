-- Update the interaction types to use 'read' instead of 'acknowledged'
ALTER TABLE user_alert_interactions DROP CONSTRAINT IF EXISTS user_alert_interactions_interaction_type_check;

ALTER TABLE user_alert_interactions 
ADD CONSTRAINT user_alert_interactions_interaction_type_check 
CHECK (interaction_type IN ('viewed', 'dismissed', 'read', 'clicked'));

-- Update existing 'acknowledged' records to 'read'
UPDATE user_alert_interactions 
SET interaction_type = 'read' 
WHERE interaction_type = 'acknowledged';

-- Update the acknowledge_activity function to use 'read' terminology
CREATE OR REPLACE FUNCTION public.acknowledge_activity(p_alert_id uuid, p_note text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user can see this alert
  IF NOT EXISTS (
    SELECT 1 FROM alerts a 
    WHERE a.id = p_alert_id 
    AND user_in_target_audience(a.target_audience)
  ) THEN
    RAISE EXCEPTION 'Alert not found or access denied';
  END IF;
  
  -- Insert or update as read
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
    'read', 
    now(), 
    p_note
  )
  ON CONFLICT (user_id, alert_id, interaction_type)
  DO UPDATE SET 
    acknowledged_at = now(),
    acknowledgment_note = EXCLUDED.acknowledgment_note;
    
  RETURN true;
END;
$function$;

-- Update the is_activity_acknowledged function to check for 'read'
CREATE OR REPLACE FUNCTION public.is_activity_acknowledged(p_alert_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM user_alert_interactions 
    WHERE user_id = auth.uid() 
    AND alert_id = p_alert_id 
    AND interaction_type = 'read'
    AND acknowledged_at IS NOT NULL
  );
$function$;