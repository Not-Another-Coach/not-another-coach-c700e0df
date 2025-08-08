-- Update existing 'accepted' coach selection requests to 'awaiting_payment'
-- This handles requests that were accepted before the new status flow was implemented
UPDATE coach_selection_requests 
SET status = 'awaiting_payment'
WHERE status = 'accepted' 
AND responded_at IS NOT NULL;