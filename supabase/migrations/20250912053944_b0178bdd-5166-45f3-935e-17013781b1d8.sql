-- Manually update Trainer 5 to fully published status
UPDATE profiles 
SET 
  verification_status = 'verified',
  is_verified = true,
  profile_published = true,
  updated_at = now()
WHERE id = '5193e290-0570-4d77-b46a-e0e21ea0aac3';

-- Also update the trainer verification overview to reflect verified status
INSERT INTO trainer_verification_overview (trainer_id, overall_status, last_computed_at)
VALUES ('5193e290-0570-4d77-b46a-e0e21ea0aac3', 'verified', now())
ON CONFLICT (trainer_id) 
DO UPDATE SET 
  overall_status = 'verified',
  last_computed_at = now(),
  updated_at = now();