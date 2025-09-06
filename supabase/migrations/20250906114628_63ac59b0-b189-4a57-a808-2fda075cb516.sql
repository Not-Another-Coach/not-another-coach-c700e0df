-- Add new lifestyle and health fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS fitness_equipment_access JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_description JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_other TEXT,
ADD COLUMN IF NOT EXISTS health_conditions TEXT,
ADD COLUMN IF NOT EXISTS has_specific_event TEXT,
ADD COLUMN IF NOT EXISTS specific_event_details TEXT,
ADD COLUMN IF NOT EXISTS specific_event_date DATE;