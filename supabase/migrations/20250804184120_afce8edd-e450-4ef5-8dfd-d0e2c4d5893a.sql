-- Add discovery-call-specific availability field to trainer_availability_settings
-- This ensures discovery call availability is separate from general training availability

ALTER TABLE public.trainer_availability_settings 
ADD COLUMN IF NOT EXISTS discovery_call_availability_schedule jsonb 
DEFAULT '{"friday": {"slots": [], "enabled": false}, "monday": {"slots": [], "enabled": false}, "sunday": {"slots": [], "enabled": false}, "tuesday": {"slots": [], "enabled": false}, "saturday": {"slots": [], "enabled": false}, "thursday": {"slots": [], "enabled": false}, "wednesday": {"slots": [], "enabled": false}}'::jsonb;

-- Add comment to clarify the difference
COMMENT ON COLUMN public.trainer_availability_settings.availability_schedule IS 'General training session availability schedule';
COMMENT ON COLUMN public.trainer_availability_settings.discovery_call_availability_schedule IS 'Specific availability schedule for discovery calls only';