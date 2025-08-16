-- Add activity_id column to onboarding_getting_started table to support activity imports
ALTER TABLE public.onboarding_getting_started 
ADD COLUMN activity_id uuid REFERENCES public.trainer_onboarding_activities(id) ON DELETE SET NULL;