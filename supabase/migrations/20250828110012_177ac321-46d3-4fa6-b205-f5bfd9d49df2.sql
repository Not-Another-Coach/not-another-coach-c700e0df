-- Update existing client journey stage records from 'discovery_call_booked' to 'getting_to_know_your_coach'
UPDATE public.profiles 
SET client_journey_stage = 'getting_to_know_your_coach'
WHERE client_journey_stage = 'discovery_call_booked';

-- Update any user journey tracking records
UPDATE public.user_journey_tracking 
SET stage = 'getting_to_know_your_coach'
WHERE stage = 'discovery_call_booked';