-- Update existing trainers to make them published and visible in Discovery
UPDATE profiles 
SET profile_published = true, updated_at = now()
WHERE user_type = 'trainer' AND profile_published = false;