-- Update the engagement_stage enum to replace 'discovery_call_booked' with 'getting_to_know_your_coach'
ALTER TYPE engagement_stage RENAME VALUE 'discovery_call_booked' TO 'getting_to_know_your_coach';

-- Force Supabase to regenerate types by adding a comment
COMMENT ON TYPE engagement_stage IS 'Updated enum with getting_to_know_your_coach replacing discovery_call_booked - timestamp: ' || NOW();