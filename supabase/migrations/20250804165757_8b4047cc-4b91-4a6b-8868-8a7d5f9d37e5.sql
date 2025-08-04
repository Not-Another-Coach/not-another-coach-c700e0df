-- Create the missing trainer profile for Louise Whitton
INSERT INTO public.profiles (
  id, 
  user_type, 
  first_name, 
  last_name,
  created_at,
  updated_at
) VALUES (
  '72884613-0f45-4980-9553-8cdb09efd5f6',
  'trainer',
  'Louise',
  'Whitton',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;