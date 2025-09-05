-- Fix the infinite recursion by modifying the trigger on trainer_verification_overview
-- to only run when display_preference changes, not when overall_status changes

DROP TRIGGER IF EXISTS update_verification_status_on_preference_change ON trainer_verification_overview;

CREATE TRIGGER update_verification_status_on_preference_change 
AFTER UPDATE ON trainer_verification_overview 
FOR EACH ROW 
WHEN (OLD.display_preference IS DISTINCT FROM NEW.display_preference)
EXECUTE FUNCTION trigger_update_verification_status();