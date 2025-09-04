-- Add missing biographical fields to trainer_profiles table
ALTER TABLE trainer_profiles 
ADD COLUMN how_started TEXT,
ADD COLUMN philosophy TEXT;