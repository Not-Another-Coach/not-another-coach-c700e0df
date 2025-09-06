-- Add new lifestyle and health fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS fitness_equipment_access JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_description JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_other TEXT,
ADD COLUMN IF NOT EXISTS health_conditions TEXT,
ADD COLUMN IF NOT EXISTS has_specific_event TEXT,
ADD COLUMN IF NOT EXISTS specific_event_details TEXT,
ADD COLUMN IF NOT EXISTS specific_event_date DATE;

-- Update the v_clients view to include new fields
CREATE OR REPLACE VIEW public.v_clients AS
SELECT
    p.*,
    cp.*
FROM public.profiles p
LEFT JOIN public.client_profiles cp ON p.id = cp.id
WHERE p.user_type = 'client';