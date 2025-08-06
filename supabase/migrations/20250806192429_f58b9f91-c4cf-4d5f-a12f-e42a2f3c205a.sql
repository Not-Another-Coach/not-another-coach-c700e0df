-- Fix security issues with function search paths
-- Update the existing functions to include proper search_path settings

-- Fix revert_waitlist_client_conversion function
CREATE OR REPLACE FUNCTION revert_waitlist_client_conversion(
  p_client_id UUID,
  p_trainer_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  has_waitlist_entry BOOLEAN;
BEGIN
  -- Check if there's an active waitlist entry for this client-trainer pair
  SELECT EXISTS(
    SELECT 1 
    FROM coach_waitlists 
    WHERE client_id = p_client_id 
      AND coach_id = p_trainer_id 
      AND status = 'active'
  ) INTO has_waitlist_entry;
  
  -- Only revert if there's an active waitlist entry
  IF has_waitlist_entry THEN
    -- Reset engagement stage back to browsing (appropriate for waitlist)
    UPDATE client_trainer_engagement
    SET 
      stage = 'browsing',
      became_client_at = NULL,
      updated_at = NOW()
    WHERE client_id = p_client_id 
      AND trainer_id = p_trainer_id
      AND stage = 'active_client';
    
    -- Remove any coach selection requests that were incorrectly created
    DELETE FROM coach_selection_requests
    WHERE client_id = p_client_id 
      AND trainer_id = p_trainer_id
      AND created_at > NOW() - INTERVAL '2 hours';
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;