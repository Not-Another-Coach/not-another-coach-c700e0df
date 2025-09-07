-- Add notification preference columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notify_profile_views boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notify_messages boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_insights boolean DEFAULT true;