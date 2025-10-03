
-- Fix Client 2's missing name data
UPDATE profiles
SET 
  first_name = 'Client',
  last_name = '2',
  updated_at = now()
WHERE id = '95050edb-5a62-47eb-a014-947b4c20daaf' AND first_name IS NULL;
