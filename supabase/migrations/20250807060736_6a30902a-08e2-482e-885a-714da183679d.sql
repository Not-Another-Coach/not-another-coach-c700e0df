-- Update discovery calls to completed status for Lou Whitton
-- This will remove the "reschedule call" option and enable "Choose This Coach"

UPDATE discovery_calls 
SET status = 'completed', updated_at = now()
WHERE trainer_id = '4f90441a-20de-4f62-99aa-2440b12228dd' 
AND status = 'scheduled';