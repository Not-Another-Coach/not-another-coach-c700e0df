-- Add profile_image_position column to profiles table
ALTER TABLE profiles 
ADD COLUMN profile_image_position JSONB;