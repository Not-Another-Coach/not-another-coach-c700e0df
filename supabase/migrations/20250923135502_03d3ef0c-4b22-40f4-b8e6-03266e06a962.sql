-- Initialize visibility settings for all existing trainers
DO $$
DECLARE
    trainer_record RECORD;
BEGIN
    -- Initialize visibility settings for all existing trainers
    FOR trainer_record IN 
        SELECT id FROM profiles WHERE user_type = 'trainer'
    LOOP
        -- Call the initialization function for each trainer
        PERFORM initialize_trainer_visibility_defaults(trainer_record.id);
    END LOOP;
END $$;

-- Create automatic trigger for new trainers
CREATE OR REPLACE FUNCTION auto_initialize_trainer_visibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Only initialize for trainer profiles
    IF NEW.user_type = 'trainer' THEN
        PERFORM initialize_trainer_visibility_defaults(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger to auto-initialize new trainers
DROP TRIGGER IF EXISTS trigger_auto_initialize_trainer_visibility ON profiles;
CREATE TRIGGER trigger_auto_initialize_trainer_visibility
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_initialize_trainer_visibility();