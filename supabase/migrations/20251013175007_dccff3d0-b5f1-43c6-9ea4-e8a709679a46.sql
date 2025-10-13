-- Force update Client 2's journey stage to discovery_call_booked
UPDATE profiles 
SET client_journey_stage = 'discovery_call_booked',
    updated_at = now()
WHERE id = '95050edb-5a62-47eb-a014-947b4c20daaf';

UPDATE client_profiles
SET client_journey_stage = 'discovery_call_booked',
    updated_at = now()
WHERE id = '95050edb-5a62-47eb-a014-947b4c20daaf';