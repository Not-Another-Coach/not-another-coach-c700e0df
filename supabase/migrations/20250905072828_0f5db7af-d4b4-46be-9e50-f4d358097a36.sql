
-- Add simplified Ways of Working columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wow_how_i_work text,
ADD COLUMN IF NOT EXISTS wow_what_i_provide text, 
ADD COLUMN IF NOT EXISTS wow_client_expectations text,
ADD COLUMN IF NOT EXISTS wow_package_applicability jsonb DEFAULT '{"apply_to": "all", "package_ids": []}'::jsonb;

-- Update the ways of working visibility column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wow_visibility text DEFAULT 'public';

-- Add comment to document the new structure
COMMENT ON COLUMN public.profiles.wow_how_i_work IS 'Simplified ways of working - How the trainer works with clients';
COMMENT ON COLUMN public.profiles.wow_what_i_provide IS 'Simplified ways of working - What the trainer provides to clients';
COMMENT ON COLUMN public.profiles.wow_client_expectations IS 'Simplified ways of working - What the trainer expects from clients';
COMMENT ON COLUMN public.profiles.wow_package_applicability IS 'JSON defining which packages these WoW apply to: {"apply_to": "all"|"specific", "package_ids": []}';
COMMENT ON COLUMN public.profiles.wow_visibility IS 'Visibility setting for ways of working: "public" or "post_match"';
