-- Add new fields for waitlist and communication preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS next_available_date DATE,
ADD COLUMN IF NOT EXISTS communication_style TEXT,
ADD COLUMN IF NOT EXISTS video_checkins BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS messaging_support BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS weekly_programming_only BOOLEAN DEFAULT false;