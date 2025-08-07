-- Force discovery call completion for testing
-- First, let's see what engagements exist for the current user
-- Then update to discovery_completed stage

-- Update any existing engagement to discovery_completed for testing
UPDATE client_trainer_engagement 
SET 
  stage = 'discovery_completed',
  discovery_completed_at = now(),
  updated_at = now()
WHERE client_id = auth.uid() 
  AND stage IN ('browsing', 'liked', 'matched', 'discovery_call_booked');

-- If no engagement exists, create one for any trainer you might be viewing
-- This will help with testing - you can replace the trainer_id with the specific one you're testing
-- For now, let's just update existing ones