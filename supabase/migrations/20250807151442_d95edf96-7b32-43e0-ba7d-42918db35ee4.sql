-- Reset ClientLou's engagement stage to test the approval process again
-- First, delete the existing coach selection request
DELETE FROM public.coach_selection_requests 
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';

-- Reset the engagement stage back to 'liked' so they can resubmit
UPDATE public.client_trainer_engagement 
SET 
  stage = 'liked',
  updated_at = now()
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';

-- Remove the alerts we created for testing
DELETE FROM public.alerts 
WHERE alert_type IN ('coach_selection_request', 'coach_selection_sent')
AND metadata->>'client_id' = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3'
AND metadata->>'trainer_id' = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';