-- Add missing column for uploaded certificates
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS uploaded_certificates jsonb DEFAULT '[]'::jsonb;