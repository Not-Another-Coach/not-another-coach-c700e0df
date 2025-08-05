-- Add new engagement stage for when discovery call is booked
ALTER TYPE engagement_stage ADD VALUE 'discovery_call_booked' AFTER 'shortlisted';