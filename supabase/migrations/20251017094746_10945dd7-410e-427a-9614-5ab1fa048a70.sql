-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule process-plan-changes to run every hour
SELECT cron.schedule(
  'process-plan-changes-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://ogpiovfxjxcclptfybrk.supabase.co/functions/v1/process-plan-changes',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncGlvdmZ4anhjY2xwdGZ5YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTg3NzEsImV4cCI6MjA2OTczNDc3MX0.wWLacGgdAd3tNAKyyigwNK91hvxnP5l4qcPABTQGyqw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Add limited mode RLS policies
-- Block payment package creation when in limited mode
CREATE POLICY "limited_mode_blocks_package_creation"
ON payment_packages
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM trainer_membership
    WHERE trainer_id = auth.uid()
    AND payment_status = 'limited_mode'
    AND is_active = true
  )
);

-- Block discovery call booking creation when trainer in limited mode
CREATE POLICY "limited_mode_blocks_discovery_calls"
ON discovery_calls
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM trainer_membership
    WHERE trainer_id = discovery_calls.trainer_id
    AND payment_status = 'limited_mode'
    AND is_active = true
  )
);

-- View scheduled cron jobs
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname LIKE '%plan%' OR jobname LIKE '%grace%';