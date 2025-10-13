-- Fix Client 2's journey stage and add trigger for automatic updates
-- Update Client 2's journey stage to discovery_call_booked since they have an active discovery call
UPDATE profiles 
SET client_journey_stage = 'discovery_call_booked',
    updated_at = now()
WHERE id = '95050edb-5a62-47eb-a014-947b4c20daaf'
  AND user_type = 'client'
  AND client_journey_stage IS NULL;

-- Also update the client_profiles table for consistency
UPDATE client_profiles
SET client_journey_stage = 'discovery_call_booked',
    updated_at = now()
WHERE id = '95050edb-5a62-47eb-a014-947b4c20daaf'
  AND client_journey_stage IS NULL;

-- Create trigger function to automatically update journey stage when discovery calls are created
CREATE OR REPLACE FUNCTION update_client_journey_on_discovery_call()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new discovery call is scheduled, update client's journey stage
  IF NEW.status = 'scheduled' THEN
    UPDATE profiles 
    SET client_journey_stage = 'discovery_call_booked',
        updated_at = now()
    WHERE id = NEW.client_id 
      AND user_type = 'client'
      AND (client_journey_stage IS NULL OR client_journey_stage = 'exploring_coaches');
    
    UPDATE client_profiles
    SET client_journey_stage = 'discovery_call_booked',
        updated_at = now()
    WHERE id = NEW.client_id
      AND (client_journey_stage IS NULL OR client_journey_stage = 'exploring_coaches');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS trigger_update_journey_on_discovery_call ON discovery_calls;
CREATE TRIGGER trigger_update_journey_on_discovery_call
  AFTER INSERT OR UPDATE ON discovery_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_client_journey_on_discovery_call();

-- Backfill any other clients with discovery calls but missing journey stages
UPDATE profiles p
SET client_journey_stage = 'discovery_call_booked',
    updated_at = now()
FROM discovery_calls dc
WHERE p.id = dc.client_id
  AND p.user_type = 'client'
  AND dc.status IN ('scheduled', 'rescheduled')
  AND (p.client_journey_stage IS NULL OR p.client_journey_stage = 'exploring_coaches');

UPDATE client_profiles cp
SET client_journey_stage = 'discovery_call_booked',
    updated_at = now()
FROM discovery_calls dc
WHERE cp.id = dc.client_id
  AND dc.status IN ('scheduled', 'rescheduled')
  AND (cp.client_journey_stage IS NULL OR cp.client_journey_stage = 'exploring_coaches');