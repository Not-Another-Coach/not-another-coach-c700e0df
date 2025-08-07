-- Clean up all interaction history between ClientLou and TrainerLou
-- First, let's get their IDs for reference
-- ClientLou: 04531ef3-6ce9-47a7-9f70-3eb87ead08c3
-- TrainerLou: f5562940-ccc4-40c2-b8dd-8f8c22311003

-- Delete messages in their conversations
DELETE FROM public.messages 
WHERE conversation_id IN (
  SELECT id FROM public.conversations 
  WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
  AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003'
);

-- Delete conversations between them
DELETE FROM public.conversations 
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';

-- Delete discovery call feedback responses
DELETE FROM public.discovery_call_feedback_responses 
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';

-- Delete discovery call feedback
DELETE FROM public.discovery_call_feedback 
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';

-- Delete discovery call notifications
DELETE FROM public.discovery_call_notifications 
WHERE discovery_call_id IN (
  SELECT id FROM public.discovery_calls 
  WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
  AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003'
);

-- Delete discovery call feedback notifications
DELETE FROM public.discovery_call_feedback_notifications 
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND discovery_call_id IN (
  SELECT id FROM public.discovery_calls 
  WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
  AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003'
);

-- Delete discovery call notes
DELETE FROM public.discovery_call_notes 
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';

-- Delete discovery calls
DELETE FROM public.discovery_calls 
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';

-- Delete coach selection requests
DELETE FROM public.coach_selection_requests 
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';

-- Delete waitlist entries
DELETE FROM public.coach_waitlists 
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND coach_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';

-- Delete alerts related to their interactions
DELETE FROM public.alerts 
WHERE (metadata->>'client_id' = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
       AND metadata->>'trainer_id' = 'f5562940-ccc4-40c2-b8dd-8f8c22311003')
   OR (metadata->>'client_id' = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
       AND metadata->>'coach_id' = 'f5562940-ccc4-40c2-b8dd-8f8c22311003');

-- Finally, delete the client-trainer engagement record (shortlist, etc.)
DELETE FROM public.client_trainer_engagement 
WHERE client_id = '04531ef3-6ce9-47a7-9f70-3eb87ead08c3' 
AND trainer_id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';