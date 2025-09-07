-- Add accuracy_confirmed column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN accuracy_confirmed boolean DEFAULT false;

-- Update Trainer 4's profile with correct terms agreement values
UPDATE public.profiles 
SET terms_agreed = true, 
    accuracy_confirmed = true,
    updated_at = now()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'trainer4@example.com'
);