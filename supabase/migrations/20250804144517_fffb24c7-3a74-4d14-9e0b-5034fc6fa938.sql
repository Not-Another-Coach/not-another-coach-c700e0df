-- Insert dummy trainer users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'trainer1@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"first_name": "Alex", "last_name": "Johnson", "user_type": "trainer"}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'trainer2@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"first_name": "Sarah", "last_name": "Smith", "user_type": "trainer"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'trainer3@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"first_name": "Mike", "last_name": "Davis", "user_type": "trainer"}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'client1@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"first_name": "Emma", "last_name": "Wilson", "user_type": "client"}'),
  ('550e8400-e29b-41d4-a716-446655440005', 'client2@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"first_name": "John", "last_name": "Brown", "user_type": "client"}'),
  ('550e8400-e29b-41d4-a716-446655440006', 'admin1@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"first_name": "Admin", "last_name": "User", "user_type": "admin"}')
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding profiles
INSERT INTO profiles (id, user_type, first_name, last_name, bio, location, specializations, hourly_rate, is_verified, profile_setup_completed)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'trainer', 'Alex', 'Johnson', 'Experienced strength and conditioning coach specializing in powerlifting and functional movement.', 'London, UK', ARRAY['Strength Training', 'Powerlifting', 'Functional Movement'], 75.00, true, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'trainer', 'Sarah', 'Smith', 'Certified personal trainer with expertise in weight loss and body transformation.', 'Manchester, UK', ARRAY['Weight Loss', 'Body Transformation', 'Nutrition'], 65.00, true, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'trainer', 'Mike', 'Davis', 'Sports performance coach working with athletes and fitness enthusiasts.', 'Birmingham, UK', ARRAY['Sports Performance', 'Athletic Training', 'Injury Prevention'], 80.00, false, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'client', 'Emma', 'Wilson', 'Looking to improve overall fitness and strength.', 'London, UK', NULL, NULL, false, false),
  ('550e8400-e29b-41d4-a716-446655440005', 'client', 'John', 'Brown', 'Seeking help with weight management and healthy lifestyle.', 'Leeds, UK', NULL, NULL, false, false),
  ('550e8400-e29b-41d4-a716-446655440006', 'admin', 'Admin', 'User', 'System administrator.', 'London, UK', NULL, NULL, false, false)
ON CONFLICT (id) DO NOTHING;

-- Add roles for the dummy users
INSERT INTO user_roles (user_id, role)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'trainer'),
  ('550e8400-e29b-41d4-a716-446655440002', 'trainer'),
  ('550e8400-e29b-41d4-a716-446655440003', 'trainer'),
  ('550e8400-e29b-41d4-a716-446655440004', 'client'),
  ('550e8400-e29b-41d4-a716-446655440005', 'client'),
  ('550e8400-e29b-41d4-a716-446655440006', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;