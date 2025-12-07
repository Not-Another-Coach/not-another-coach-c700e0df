-- Add preferred_client_experience_levels column to trainer_profiles
ALTER TABLE public.trainer_profiles 
ADD COLUMN IF NOT EXISTS preferred_client_experience_levels text[] DEFAULT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.trainer_profiles.preferred_client_experience_levels IS 'Array of experience levels this trainer prefers to work with: beginner, intermediate, advanced';