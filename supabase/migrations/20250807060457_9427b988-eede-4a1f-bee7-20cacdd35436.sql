-- Force discovery call completion for Lou Whitton for testing
-- Update engagement to discovery_completed for Lou Whitton (Trainer Lou)
INSERT INTO client_trainer_engagement (client_id, trainer_id, stage, discovery_completed_at)
VALUES (auth.uid(), '4f90441a-20de-4f62-99aa-2440b12228dd', 'discovery_completed', now())
ON CONFLICT (client_id, trainer_id)
DO UPDATE SET 
  stage = 'discovery_completed',
  discovery_completed_at = now(),
  updated_at = now();