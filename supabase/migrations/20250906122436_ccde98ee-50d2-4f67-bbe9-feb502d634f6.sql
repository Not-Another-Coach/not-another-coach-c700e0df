-- Publish existing trainers to make them visible in Discovery
UPDATE profiles 
SET profile_published = true, updated_at = now()
WHERE id IN (
  '1051dd7c-ee79-48fd-b287-2cbe7483f9f7',  -- Trainer4
  'f5562940-ccc4-40c2-b8dd-8f8c22311003'   -- TrainerLou
) AND user_type = 'trainer';