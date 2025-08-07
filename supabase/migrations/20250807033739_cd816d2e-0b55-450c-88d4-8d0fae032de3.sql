-- Create test users for development and testing
-- Insert test profiles for development (only if they don't exist)

-- Test client user
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  user_type,
  created_at,
  updated_at
)
SELECT 
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Test',
  'Client',
  'client'::user_type,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111'::uuid
);

-- Test trainer user
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  user_type,
  created_at,
  updated_at
)
SELECT 
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Test',
  'Trainer',
  'trainer'::user_type,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222'::uuid
);

-- Test admin user
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  user_type,
  created_at,
  updated_at
)
SELECT 
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Test',
  'Admin',
  'admin'::user_type,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = '33333333-3333-3333-3333-333333333333'::uuid
);

-- Add admin role to test admin user
INSERT INTO public.user_roles (
  user_id,
  role,
  created_at,
  updated_at
)
SELECT 
  '33333333-3333-3333-3333-333333333333'::uuid,
  'admin'::app_role,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '33333333-3333-3333-3333-333333333333'::uuid 
  AND role = 'admin'::app_role
);

-- Create a function to create test auth users with known passwords
-- Note: This would need to be done manually in Supabase Auth or through a separate process
-- since we cannot directly insert into auth.users table

-- Add some comments for manual setup
COMMENT ON TABLE public.profiles IS 'To complete test user setup, manually create auth users in Supabase Auth with these credentials:
- client@test.com / password123 (for Test Client)
- trainer@test.com / password123 (for Test Trainer)  
- admin@test.com / password123 (for Test Admin)
Use the respective profile IDs as the auth user IDs.';