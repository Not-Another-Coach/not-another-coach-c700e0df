-- Temporarily disable the auto_publish trigger and manually update
DROP TRIGGER auto_publish_on_verification_trigger ON profiles;

-- Update Trainer 4's profile
UPDATE profiles 
SET profile_published = true,
    updated_at = now()
WHERE id = '1051dd7c-ee79-48fd-b287-2cbe7483f9f7';

-- Recreate the trigger 
CREATE TRIGGER auto_publish_on_verification_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_publish_on_verification();