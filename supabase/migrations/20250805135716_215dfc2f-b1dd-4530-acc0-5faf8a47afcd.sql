-- Add new stages to engagement_stage enum
ALTER TYPE engagement_stage ADD VALUE 'shortlisted';
ALTER TYPE engagement_stage ADD VALUE 'unmatched'; 
ALTER TYPE engagement_stage ADD VALUE 'declined';

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

-- Update the engagement stage transition function to handle new stages
CREATE OR REPLACE FUNCTION public.update_engagement_stage(client_uuid uuid, trainer_uuid uuid, new_stage engagement_stage)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.client_trainer_engagement (client_id, trainer_id, stage)
  VALUES (client_uuid, trainer_uuid, new_stage)
  ON CONFLICT (client_id, trainer_id)
  DO UPDATE SET 
    stage = new_stage,
    updated_at = now(),
    liked_at = CASE WHEN new_stage = 'liked' AND OLD.liked_at IS NULL THEN now() ELSE OLD.liked_at END,
    matched_at = CASE WHEN new_stage = 'matched' AND OLD.matched_at IS NULL THEN now() ELSE OLD.matched_at END,
    discovery_completed_at = CASE WHEN new_stage = 'discovery_completed' AND OLD.discovery_completed_at IS NULL THEN now() ELSE OLD.discovery_completed_at END,
    became_client_at = CASE WHEN new_stage = 'active_client' AND OLD.became_client_at IS NULL THEN now() ELSE OLD.became_client_at END;
END;
$$;

-- Drop the redundant tables
DROP TABLE IF EXISTS saved_trainers;
DROP TABLE IF EXISTS shortlisted_trainers;