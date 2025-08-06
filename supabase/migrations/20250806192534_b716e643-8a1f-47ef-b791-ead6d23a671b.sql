-- Undo the incorrect engagement stage change
-- Reset Sarah Johnson's engagement with Linda Perez back to browsing

UPDATE client_trainer_engagement 
SET 
  stage = 'browsing',
  became_client_at = NULL,
  updated_at = NOW()
WHERE client_id = 'f75ee299-6ba0-48c5-b64a-1269d45aa67e'
  AND trainer_id = 'bb19a665-f35f-4828-a62c-90ce437bfb18'
  AND stage = 'shortlisted';

-- Also remove any coach selection requests that may have been created
DELETE FROM coach_selection_requests
WHERE client_id = 'f75ee299-6ba0-48c5-b64a-1269d45aa67e'
  AND trainer_id = 'bb19a665-f35f-4828-a62c-90ce437bfb18'
  AND created_at > NOW() - INTERVAL '3 hours';