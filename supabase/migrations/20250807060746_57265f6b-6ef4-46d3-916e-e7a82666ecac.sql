-- Disable the problematic trigger temporarily, update discovery calls, then re-enable
ALTER TABLE discovery_calls DISABLE TRIGGER ALL;

UPDATE discovery_calls 
SET status = 'completed', updated_at = now()
WHERE trainer_id = '4f90441a-20de-4f62-99aa-2440b12228dd' 
AND status = 'scheduled';

ALTER TABLE discovery_calls ENABLE TRIGGER ALL;