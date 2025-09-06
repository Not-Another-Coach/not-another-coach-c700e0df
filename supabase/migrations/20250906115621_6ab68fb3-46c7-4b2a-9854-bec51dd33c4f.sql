-- Simple fix: Just ensure lifestyle fields exist in client_profiles and remove duplicates from profiles
-- Add missing lifestyle fields to client_profiles table if they don't exist
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS fitness_equipment_access JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_description JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_other TEXT,
ADD COLUMN IF NOT EXISTS health_conditions TEXT,
ADD COLUMN IF NOT EXISTS has_specific_event TEXT,
ADD COLUMN IF NOT EXISTS specific_event_details TEXT,
ADD COLUMN IF NOT EXISTS specific_event_date DATE;

-- Remove only the lifestyle fields we just added from profiles table
-- (These were incorrectly added in the previous migration)
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS fitness_equipment_access,
DROP COLUMN IF EXISTS lifestyle_description,
DROP COLUMN IF EXISTS lifestyle_other,
DROP COLUMN IF EXISTS health_conditions,
DROP COLUMN IF EXISTS has_specific_event,
DROP COLUMN IF EXISTS specific_event_details,
DROP COLUMN IF EXISTS specific_event_date;