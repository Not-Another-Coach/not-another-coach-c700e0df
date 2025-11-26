-- Add profile fields for client survey
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender_preference text,
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS phone_number text;

COMMENT ON COLUMN profiles.gender_preference IS 'Gender preference for coaching (prefer_not_to_say, male, female, non_binary, other)';
COMMENT ON COLUMN profiles.timezone IS 'IANA timezone string (e.g., America/New_York)';
COMMENT ON COLUMN profiles.phone_number IS 'Phone number with country code';