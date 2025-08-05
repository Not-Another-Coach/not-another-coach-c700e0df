-- Clean up invalid trainer IDs that are not proper UUIDs
-- Remove saved trainers with invalid trainer_id format
DELETE FROM saved_trainers 
WHERE trainer_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Remove shortlisted trainers with invalid trainer_id format  
DELETE FROM shortlisted_trainers 
WHERE trainer_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Add constraint to prevent future invalid UUID entries in saved_trainers
ALTER TABLE saved_trainers 
ADD CONSTRAINT saved_trainers_trainer_id_uuid_check 
CHECK (trainer_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Add constraint to prevent future invalid UUID entries in shortlisted_trainers
ALTER TABLE shortlisted_trainers 
ADD CONSTRAINT shortlisted_trainers_trainer_id_uuid_check 
CHECK (trainer_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');