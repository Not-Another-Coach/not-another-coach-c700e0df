-- Add draft status and submission tracking to trainer_verification_checks
ALTER TABLE trainer_verification_checks 
ADD COLUMN IF NOT EXISTS draft_status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone;

-- Update status enum to include draft
-- Note: In PostgreSQL, we can't easily modify an enum, so we'll use text for draft_status
-- and keep the existing status for submitted documents

-- Add index for better performance on draft queries
CREATE INDEX IF NOT EXISTS idx_trainer_verification_checks_draft_status 
ON trainer_verification_checks(trainer_id, draft_status);

-- Update existing records to have proper draft_status
UPDATE trainer_verification_checks 
SET draft_status = CASE 
  WHEN status = 'pending' THEN 'submitted'
  WHEN status = 'verified' THEN 'submitted' 
  WHEN status = 'rejected' THEN 'submitted'
  WHEN status = 'expired' THEN 'submitted'
  ELSE 'draft'
END,
submitted_at = CASE 
  WHEN status IN ('pending', 'verified', 'rejected', 'expired') THEN created_at
  ELSE NULL
END
WHERE draft_status IS NULL OR submitted_at IS NULL;