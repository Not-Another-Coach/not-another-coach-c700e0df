-- Force discovery call completion for Lou Whitton for testing
-- Use a direct client ID - assuming you're testing with one of the client accounts
-- This will create/update engagement to discovery_completed for Lou Whitton

-- Update engagement for all clients to have discovered Lou Whitton
INSERT INTO client_trainer_engagement (client_id, trainer_id, stage, discovery_completed_at)
VALUES 
  ('8ebe71e4-acbc-4ed5-81cc-0e977c8052af', '4f90441a-20de-4f62-99aa-2440b12228dd', 'discovery_completed', now()),
  ('9b0a2e64-527e-470e-aef1-c78b95e495d4', '4f90441a-20de-4f62-99aa-2440b12228dd', 'discovery_completed', now()),
  ('05a4c442-1c16-49b9-b7f0-3a4ef42de26a', '4f90441a-20de-4f62-99aa-2440b12228dd', 'discovery_completed', now()),
  ('51d081ac-68f8-4ecc-92f4-29235a36ceb7', '4f90441a-20de-4f62-99aa-2440b12228dd', 'discovery_completed', now()),
  ('f75ee299-6ba0-48c5-b64a-1269d45aa67e', '4f90441a-20de-4f62-99aa-2440b12228dd', 'discovery_completed', now())
ON CONFLICT (client_id, trainer_id)
DO UPDATE SET 
  stage = 'discovery_completed',
  discovery_completed_at = now(),
  updated_at = now();