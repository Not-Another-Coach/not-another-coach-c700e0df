-- Add some test shortlisted trainers for the current user
INSERT INTO public.shortlisted_trainers (user_id, trainer_id, notes, chat_enabled, discovery_call_enabled, shortlisted_at)
VALUES 
  ('c28959b8-d6f4-4fb0-9e1d-e9a9dcd2fbfb', '4f90441a-20de-4f62-99aa-2440b12228dd', 'Great experience with strength training', true, true, now()),
  ('c28959b8-d6f4-4fb0-9e1d-e9a9dcd2fbfb', '550e8400-e29b-41d4-a716-446655440001', 'Specializes in weight loss', true, true, now()),
  ('c28959b8-d6f4-4fb0-9e1d-e9a9dcd2fbfb', '550e8400-e29b-41d4-a716-446655440002', 'Powerlifting expert', true, true, now())
ON CONFLICT (user_id, trainer_id) DO NOTHING;

-- Update one of your scheduled discovery calls to completed status to test the discovery calls tab
UPDATE public.discovery_calls 
SET status = 'completed'
WHERE client_id = 'c28959b8-d6f4-4fb0-9e1d-e9a9dcd2fbfb' 
  AND trainer_id = '4f90441a-20de-4f62-99aa-2440b12228dd'
  AND id = '47a7229f-0544-4907-bfb8-f0742b41bc55';