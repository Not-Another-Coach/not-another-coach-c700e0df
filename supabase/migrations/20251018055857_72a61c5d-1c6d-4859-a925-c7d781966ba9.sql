-- Add plan_definition_id to trainer_membership
ALTER TABLE trainer_membership 
ADD COLUMN IF NOT EXISTS plan_definition_id UUID REFERENCES membership_plan_definitions(id);

CREATE INDEX IF NOT EXISTS idx_trainer_membership_plan_definition_id 
ON trainer_membership(plan_definition_id);

-- Migrate existing data based on plan_type
UPDATE trainer_membership tm
SET plan_definition_id = (
  SELECT mpd.id 
  FROM membership_plan_definitions mpd
  WHERE mpd.plan_type = tm.plan_type
  ORDER BY mpd.monthly_price_cents DESC
  LIMIT 1
)
WHERE tm.plan_definition_id IS NULL AND tm.plan_type IS NOT NULL;

-- Make plan_definition_id NOT NULL
ALTER TABLE trainer_membership 
ALTER COLUMN plan_definition_id SET NOT NULL;

-- Drop old plan_type column
ALTER TABLE trainer_membership 
DROP COLUMN IF EXISTS plan_type;

-- Update trainer_membership_history
ALTER TABLE trainer_membership_history 
ADD COLUMN IF NOT EXISTS to_plan_id UUID REFERENCES membership_plan_definitions(id),
ADD COLUMN IF NOT EXISTS from_plan_id UUID REFERENCES membership_plan_definitions(id);

ALTER TABLE trainer_membership_history 
DROP COLUMN IF EXISTS to_plan_type,
DROP COLUMN IF EXISTS from_plan_type;

-- Drop plan_type from membership_plan_definitions
ALTER TABLE membership_plan_definitions 
DROP COLUMN IF EXISTS plan_type;

-- Ensure description column exists
ALTER TABLE membership_plan_definitions 
ADD COLUMN IF NOT EXISTS description TEXT;