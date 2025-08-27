-- Add missing profile fields for trainer setup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS how_started TEXT,
ADD COLUMN IF NOT EXISTS philosophy TEXT,
ADD COLUMN IF NOT EXISTS specialization_description TEXT,
ADD COLUMN IF NOT EXISTS professional_milestones JSONB DEFAULT '[]'::jsonb;