-- Enable discovery calls for Trainer 4 and Trainer 5
UPDATE trainer_profiles
SET offers_discovery_call = true
WHERE id IN (
  '1051dd7c-ee79-48fd-b287-2cbe7483f9f7', -- Trainer 4
  '5193e290-0570-4d77-b46a-e0e21ea0aac3'  -- Trainer 5
);