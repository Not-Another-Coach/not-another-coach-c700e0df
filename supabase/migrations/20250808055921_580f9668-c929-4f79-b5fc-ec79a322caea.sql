-- Remove the incorrectly attached trigger from discovery_calls table
DROP TRIGGER IF EXISTS update_client_status_on_discovery_call ON discovery_calls;

-- The update_client_status function should only be used on the profiles table
-- Let's verify it's correctly attached there
DROP TRIGGER IF EXISTS update_client_status_trigger ON profiles;

-- Re-create the trigger only on the profiles table where it belongs
CREATE TRIGGER update_client_status_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_client_status();