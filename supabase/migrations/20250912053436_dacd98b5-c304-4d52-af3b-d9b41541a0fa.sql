-- Clean up Trainer 5's certificate data (corrected)
-- First, clear any uploaded certificates from the old system
UPDATE trainer_profiles 
SET uploaded_certificates = '[]'::jsonb 
WHERE id = '5193e290-0570-4d77-b46a-e0e21ea0aac3';

-- Then, remove any qualification verification checks from the new system
DELETE FROM trainer_verification_checks 
WHERE trainer_id = '5193e290-0570-4d77-b46a-e0e21ea0aac3' 
AND check_type = 'qualifications';