-- Make offers_discovery_call nullable and remove default
ALTER TABLE discovery_call_settings 
  ALTER COLUMN offers_discovery_call DROP NOT NULL,
  ALTER COLUMN offers_discovery_call DROP DEFAULT;

-- Existing records with false will remain false (they've made a choice)
-- New records will start as null (not yet configured)