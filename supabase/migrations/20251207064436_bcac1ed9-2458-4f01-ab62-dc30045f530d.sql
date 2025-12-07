-- Phase A: Add gender fields and client preferences

-- 1. Create ENUMs for new fields
CREATE TYPE user_gender AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
CREATE TYPE trainer_gender_preference AS ENUM ('male', 'female', 'no_preference');
CREATE TYPE discovery_call_preference AS ENUM ('required', 'prefer_no', 'flexible');

-- 2. Rename profiles.gender_preference to profiles.gender for clarity
-- This field represents the user's own gender (not a preference)
ALTER TABLE profiles RENAME COLUMN gender_preference TO gender;

-- 3. Add comment for clarity
COMMENT ON COLUMN profiles.gender IS 'The user''s own gender identity (applies to both trainers and clients)';

-- 4. Add new columns to client_profiles for matching preferences
ALTER TABLE client_profiles 
  ADD COLUMN trainer_gender_preference trainer_gender_preference DEFAULT 'no_preference',
  ADD COLUMN discovery_call_preference discovery_call_preference DEFAULT 'flexible';

-- 5. Add comments for new columns
COMMENT ON COLUMN client_profiles.trainer_gender_preference IS 'Client''s preference for their trainer''s gender';
COMMENT ON COLUMN client_profiles.discovery_call_preference IS 'Client''s preference for having a discovery call before committing';