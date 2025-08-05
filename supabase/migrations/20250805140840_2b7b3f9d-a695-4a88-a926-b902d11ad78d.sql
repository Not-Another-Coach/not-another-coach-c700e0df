-- Migrate shortlisted_trainers data to client_trainer_engagement
INSERT INTO client_trainer_engagement (client_id, trainer_id, stage, created_at, updated_at)
SELECT 
  user_id as client_id,
  trainer_id::uuid,
  'shortlisted'::engagement_stage,
  shortlisted_at,
  updated_at
FROM shortlisted_trainers
ON CONFLICT (client_id, trainer_id) 
DO UPDATE SET 
  stage = 'shortlisted'::engagement_stage,
  updated_at = EXCLUDED.updated_at;

-- Migrate saved_trainers data to client_trainer_engagement (as 'liked')
INSERT INTO client_trainer_engagement (client_id, trainer_id, stage, created_at, updated_at, notes)
SELECT 
  user_id as client_id,
  trainer_id::uuid,
  'liked'::engagement_stage,
  saved_at,
  saved_at,
  notes
FROM saved_trainers
ON CONFLICT (client_id, trainer_id) 
DO UPDATE SET 
  notes = COALESCE(EXCLUDED.notes, client_trainer_engagement.notes),
  updated_at = EXCLUDED.updated_at;

-- Update the conversations RLS policy to use engagement instead of shortlisted_trainers
DROP POLICY IF EXISTS "Clients can create conversations with shortlisted trainers" ON conversations;

CREATE POLICY "Clients can create conversations with engaged trainers" 
ON conversations 
FOR INSERT
WITH CHECK (
  (auth.uid() = client_id) AND 
  (EXISTS (
    SELECT 1
    FROM client_trainer_engagement
    WHERE client_id = auth.uid() 
      AND trainer_id = conversations.trainer_id 
      AND stage IN ('shortlisted', 'matched', 'discovery_completed', 'active_client')
  ))
);

-- Drop the redundant tables
DROP TABLE IF EXISTS saved_trainers;
DROP TABLE IF EXISTS shortlisted_trainers;