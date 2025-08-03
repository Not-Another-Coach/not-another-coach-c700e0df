-- Add Ways of Working fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN ways_of_working_onboarding jsonb DEFAULT '[]'::jsonb,
ADD COLUMN ways_of_working_first_week jsonb DEFAULT '[]'::jsonb,
ADD COLUMN ways_of_working_ongoing_structure jsonb DEFAULT '[]'::jsonb,
ADD COLUMN ways_of_working_tracking_tools jsonb DEFAULT '[]'::jsonb,
ADD COLUMN ways_of_working_client_expectations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN ways_of_working_what_i_bring jsonb DEFAULT '[]'::jsonb,
ADD COLUMN ways_of_working_visibility text DEFAULT 'public',
ADD COLUMN ways_of_working_completed boolean DEFAULT false;