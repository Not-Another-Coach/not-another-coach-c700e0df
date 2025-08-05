-- Add the trainer with completed discovery call to shortlisted_trainers
INSERT INTO public.shortlisted_trainers (user_id, trainer_id, notes, chat_enabled, discovery_call_enabled, shortlisted_at)
VALUES 
  ('c28959b8-d6f4-4fb0-9e1d-e9a9dcd2fbfb', '4f90441a-20de-4f62-99aa-2440b12228dd', 'Great experience with strength training', true, true, now() - INTERVAL '1 day');