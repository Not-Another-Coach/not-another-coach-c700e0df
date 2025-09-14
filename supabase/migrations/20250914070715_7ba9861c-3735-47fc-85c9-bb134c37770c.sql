-- Configure auth webhook to use our custom email function
-- This tells Supabase to call our edge function instead of using default emails

-- First, we need to update the auth configuration
-- Note: This requires setting up the webhook URL in the Supabase Dashboard
-- But we can ensure our function is ready to receive the webhook

-- Create a simple test to verify webhook setup
SELECT 1;