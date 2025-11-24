-- Add training_type_delivery and document_not_applicable columns to trainer_profiles
ALTER TABLE trainer_profiles 
ADD COLUMN IF NOT EXISTS training_type_delivery JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS document_not_applicable JSONB DEFAULT '{}';