-- Add missing columns for expertise section
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS languages text[],
ADD COLUMN IF NOT EXISTS delivery_format text;