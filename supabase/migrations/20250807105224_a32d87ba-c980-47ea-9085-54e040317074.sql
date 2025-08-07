-- Rename trainer_availability_settings to discovery_call_settings for clarity
ALTER TABLE trainer_availability_settings RENAME TO discovery_call_settings;

-- Update the foreign key constraint name to match
ALTER INDEX IF EXISTS trainer_availability_settings_trainer_id_key RENAME TO discovery_call_settings_trainer_id_key;
ALTER INDEX IF EXISTS trainer_availability_settings_pkey RENAME TO discovery_call_settings_pkey;

-- Create discovery call settings for TrainerLou using their existing availability_slots
INSERT INTO discovery_call_settings (
  trainer_id,
  offers_discovery_call,
  discovery_call_duration,
  discovery_call_availability_schedule,
  prep_notes
) VALUES (
  'f5562940-ccc4-40c2-b8dd-8f8c22311003',
  false, -- TrainerLou doesn't offer discovery calls yet
  15,
  '{"monday": {"enabled": true, "slots": [{"start": "06:00", "end": "18:00"}]}, "tuesday": {"enabled": true, "slots": [{"start": "06:00", "end": "18:00"}]}, "wednesday": {"enabled": true, "slots": [{"start": "06:00", "end": "18:00"}]}, "thursday": {"enabled": true, "slots": [{"start": "06:00", "end": "18:00"}]}, "friday": {"enabled": true, "slots": [{"start": "06:00", "end": "18:00"}]}, "saturday": {"enabled": false, "slots": []}, "sunday": {"enabled": false, "slots": []}}',
  'Available for discovery calls during regular training hours'
)
ON CONFLICT (trainer_id) DO UPDATE SET
  discovery_call_availability_schedule = EXCLUDED.discovery_call_availability_schedule,
  prep_notes = EXCLUDED.prep_notes;

-- Update TrainerLou's profile to be published and verified for testing
UPDATE profiles 
SET 
  verification_status = 'verified',
  profile_published = true
WHERE id = 'f5562940-ccc4-40c2-b8dd-8f8c22311003';