-- Function to undo incorrect client conversion from waitlist
-- This will revert any engagement stage changes that happened due to the incorrect button click

-- First, let's see what engagement stages exist for recent waitlist interactions
SELECT 
  cte.id,
  cte.client_id,
  cte.trainer_id,
  cte.stage,
  cte.updated_at,
  cte.became_client_at,
  p_client.first_name || ' ' || p_client.last_name as client_name,
  p_trainer.first_name || ' ' || p_trainer.last_name as trainer_name
FROM client_trainer_engagement cte
JOIN profiles p_client ON cte.client_id = p_client.id
JOIN profiles p_trainer ON cte.trainer_id = p_trainer.id
WHERE cte.updated_at > NOW() - INTERVAL '2 hours'
   OR cte.became_client_at > NOW() - INTERVAL '2 hours'
ORDER BY cte.updated_at DESC;

-- Check for any coach selection requests that might have been created
SELECT 
  csr.id,
  csr.client_id,
  csr.trainer_id,
  csr.status,
  csr.created_at
FROM coach_selection_requests csr
WHERE csr.created_at > NOW() - INTERVAL '2 hours'
ORDER BY csr.created_at DESC;

-- Create a function to safely revert engagement stages for waitlist clients
CREATE OR REPLACE FUNCTION revert_waitlist_client_conversion(
  p_client_id UUID,
  p_trainer_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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