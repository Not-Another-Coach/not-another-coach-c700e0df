-- Update the engagement_stage enum to replace 'discovery_call_booked' with 'getting_to_know_your_coach'
ALTER TYPE engagement_stage RENAME VALUE 'discovery_call_booked' TO 'getting_to_know_your_coach';

-- Update the client_journey_stage enum as well if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_journey_stage') THEN
        ALTER TYPE client_journey_stage RENAME VALUE 'discovery_call_booked' TO 'getting_to_know_your_coach';
    END IF;
END $$;

-- Update any remaining check constraints or default values that might reference the old stage
UPDATE platform_settings 
SET setting_value = jsonb_set(
    setting_value, 
    '{stages}', 
    (
        SELECT jsonb_agg(
            CASE 
                WHEN stage_item->>'name' = 'discovery_call_booked' 
                THEN jsonb_set(stage_item, '{name}', '"getting_to_know_your_coach"')
                ELSE stage_item
            END
        )
        FROM jsonb_array_elements(setting_value->'stages') AS stage_item
    )
)
WHERE setting_key = 'client_journey_stages' 
AND setting_value ? 'stages';

-- Refresh any materialized views or cached data that might use these enums
-- (This forces Supabase to regenerate types)
COMMENT ON TYPE engagement_stage IS 'Updated to use getting_to_know_your_coach instead of discovery_call_booked';
COMMENT ON TYPE client_journey_stage IS 'Updated to use getting_to_know_your_coach instead of discovery_call_booked';