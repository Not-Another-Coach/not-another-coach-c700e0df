-- Add missing engagement_stage enum value
ALTER TYPE engagement_stage ADD VALUE IF NOT EXISTS 'discovery_call_booked';