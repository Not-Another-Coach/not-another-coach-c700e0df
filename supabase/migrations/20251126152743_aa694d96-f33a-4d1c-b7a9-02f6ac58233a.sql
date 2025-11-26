-- Add column to track welcome email status
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;

-- Create index for efficient querying by the cron job
CREATE INDEX IF NOT EXISTS idx_profiles_welcome_email_pending 
ON profiles(created_at, welcome_email_sent) 
WHERE welcome_email_sent = FALSE;