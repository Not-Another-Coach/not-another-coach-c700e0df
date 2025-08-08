-- Add availability_schedule column to coach_availability_settings
ALTER TABLE public.coach_availability_settings 
ADD COLUMN availability_schedule JSONB DEFAULT '{"monday": {"enabled": false, "slots": []}, "tuesday": {"enabled": false, "slots": []}, "wednesday": {"enabled": false, "slots": []}, "thursday": {"enabled": false, "slots": []}, "friday": {"enabled": false, "slots": []}, "saturday": {"enabled": false, "slots": []}, "sunday": {"enabled": false, "slots": []}}'::jsonb;

-- Migrate existing availability_schedule data from discovery_call_settings to coach_availability_settings
-- Note: This is a complex migration since we need to handle cases where coach_availability_settings might not exist
INSERT INTO public.coach_availability_settings (
  coach_id, 
  availability_status, 
  availability_schedule,
  allow_discovery_calls_on_waitlist, 
  auto_follow_up_days,
  created_at,
  updated_at
)
SELECT 
  trainer_id,
  'accepting'::coach_availability_status,
  CASE 
    WHEN availability_schedule IS NOT NULL THEN availability_schedule
    ELSE '{"monday": {"enabled": false, "slots": []}, "tuesday": {"enabled": false, "slots": []}, "wednesday": {"enabled": false, "slots": []}, "thursday": {"enabled": false, "slots": []}, "friday": {"enabled": false, "slots": []}, "saturday": {"enabled": false, "slots": []}, "sunday": {"enabled": false, "slots": []}}'::jsonb
  END,
  true,
  14,
  created_at,
  updated_at
FROM public.discovery_call_settings dcs
WHERE NOT EXISTS (
  SELECT 1 FROM public.coach_availability_settings cas 
  WHERE cas.coach_id = dcs.trainer_id
)
AND availability_schedule IS NOT NULL 
AND availability_schedule != '{"monday": {"enabled": false, "slots": []}, "tuesday": {"enabled": false, "slots": []}, "wednesday": {"enabled": false, "slots": []}, "thursday": {"enabled": false, "slots": []}, "friday": {"enabled": false, "slots": []}, "saturday": {"enabled": false, "slots": []}, "sunday": {"enabled": false, "slots": []}}'::jsonb;

-- Update existing coach_availability_settings with availability_schedule from discovery_call_settings
UPDATE public.coach_availability_settings cas
SET 
  availability_schedule = dcs.availability_schedule,
  updated_at = now()
FROM public.discovery_call_settings dcs
WHERE cas.coach_id = dcs.trainer_id
  AND dcs.availability_schedule IS NOT NULL
  AND dcs.availability_schedule != '{"monday": {"enabled": false, "slots": []}, "tuesday": {"enabled": false, "slots": []}, "wednesday": {"enabled": false, "slots": []}, "thursday": {"enabled": false, "slots": []}, "friday": {"enabled": false, "slots": []}, "saturday": {"enabled": false, "slots": []}, "sunday": {"enabled": false, "slots": []}}'::jsonb;

-- Remove the old availability_schedule column from discovery_call_settings since it should only have discovery call schedule
-- We'll keep discovery_call_availability_schedule for actual discovery call scheduling
ALTER TABLE public.discovery_call_settings DROP COLUMN IF EXISTS availability_schedule;