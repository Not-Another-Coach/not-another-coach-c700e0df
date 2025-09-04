-- Add missing columns to trainer_profiles table
ALTER TABLE trainer_profiles 
ADD COLUMN IF NOT EXISTS coaching_style text[],
ADD COLUMN IF NOT EXISTS client_preferences text[],  
ADD COLUMN IF NOT EXISTS ideal_client_personality text,
ADD COLUMN IF NOT EXISTS ideal_client_types text[];