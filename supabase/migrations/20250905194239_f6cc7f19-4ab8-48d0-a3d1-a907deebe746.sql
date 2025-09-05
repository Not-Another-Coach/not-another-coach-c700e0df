-- Remove all auto-generated activities from Ways of Working
DELETE FROM public.trainer_onboarding_activities 
WHERE source_type = 'ways_of_working' OR source_type = 'auto_generated';

-- Update any remaining activities to ensure proper source_type
UPDATE public.trainer_onboarding_activities 
SET source_type = 'manual' 
WHERE source_type IS NULL AND trainer_id IS NOT NULL AND is_system = false;