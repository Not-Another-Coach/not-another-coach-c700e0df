-- Set up availability settings for Linda and Mike to demonstrate different scenarios
-- Linda: Set to waitlist to demonstrate waitlist functionality
INSERT INTO coach_availability_settings (coach_id, availability_status, waitlist_message, next_available_date)
VALUES (
  'bb19a665-f35f-4828-a62c-90ce437bfb18',
  'waitlist',
  'Currently at capacity but happy to add you to my waitlist for when a spot opens up!',
  '2025-03-01'
) ON CONFLICT (coach_id) DO UPDATE SET
  availability_status = 'waitlist',
  waitlist_message = 'Currently at capacity but happy to add you to my waitlist for when a spot opens up!',
  next_available_date = '2025-03-01';

-- Mike: Set to accepting to show regular booking flow  
INSERT INTO coach_availability_settings (coach_id, availability_status, next_available_date)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003', 
  'accepting',
  '2025-02-15'
) ON CONFLICT (coach_id) DO UPDATE SET
  availability_status = 'accepting',
  next_available_date = '2025-02-15';

-- Set up Mike's trainer availability settings so he offers discovery calls
INSERT INTO trainer_availability_settings (trainer_id, offers_discovery_call)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  true
) ON CONFLICT (trainer_id) DO UPDATE SET
  offers_discovery_call = true;