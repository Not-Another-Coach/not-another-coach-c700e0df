-- Add Ways of Working columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wow_how_i_work TEXT,
ADD COLUMN IF NOT EXISTS wow_what_i_provide TEXT,
ADD COLUMN IF NOT EXISTS wow_client_expectations TEXT,
ADD COLUMN IF NOT EXISTS wow_activities JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS wow_activity_assignments JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS wow_visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS wow_setup_completed BOOLEAN DEFAULT FALSE;

-- Add comment explaining the new columns
COMMENT ON COLUMN public.profiles.wow_how_i_work IS 'Text description of how the trainer works';
COMMENT ON COLUMN public.profiles.wow_what_i_provide IS 'Text description of what the trainer provides';  
COMMENT ON COLUMN public.profiles.wow_client_expectations IS 'Text description of client expectations';
COMMENT ON COLUMN public.profiles.wow_activities IS 'JSON structure containing selected activities for each Ways of Working section';
COMMENT ON COLUMN public.profiles.wow_activity_assignments IS 'JSON array of activity package assignments';
COMMENT ON COLUMN public.profiles.wow_visibility IS 'Visibility setting for Ways of Working (public/post_match)';
COMMENT ON COLUMN public.profiles.wow_setup_completed IS 'Boolean flag indicating if Ways of Working setup is completed';

-- Create index on wow_visibility for performance
CREATE INDEX IF NOT EXISTS idx_profiles_wow_visibility ON public.profiles(wow_visibility);

-- Create index on wow_setup_completed for performance  
CREATE INDEX IF NOT EXISTS idx_profiles_wow_setup_completed ON public.profiles(wow_setup_completed);