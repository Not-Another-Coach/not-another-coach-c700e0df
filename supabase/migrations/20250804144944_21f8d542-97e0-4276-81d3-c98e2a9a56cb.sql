-- Publish Louise Whitton's trainer profile and verify her
UPDATE profiles 
SET 
  profile_published = true, 
  verification_status = 'verified',
  profile_setup_completed = true
WHERE id = '4f90441a-20de-4f62-99aa-2440b12228dd' AND user_type = 'trainer';

-- Also verify the dummy trainers we created earlier
UPDATE profiles 
SET 
  profile_published = true, 
  verification_status = 'verified'
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003'
) AND user_type = 'trainer';