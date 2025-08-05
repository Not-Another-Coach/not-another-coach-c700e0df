-- Manually create the missing engagement record for Sarah Johnson liking Sophie NG
INSERT INTO public.client_trainer_engagement (client_id, trainer_id, stage, liked_at, created_at, updated_at)
VALUES (
  'f75ee299-6ba0-48c5-b64a-1269d45aa67e', -- Sarah Johnson's ID
  '1d84df1e-e31c-4c91-a23b-a6bbc95a2222', -- Sophie NG's ID
  'liked',
  now(),
  now(), 
  now()
)
ON CONFLICT (client_id, trainer_id) DO NOTHING;