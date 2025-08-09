-- Create public bucket for guidance images
INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding-public', 'onboarding-public', true)
ON CONFLICT (id) DO NOTHING;

-- Schedule cron job to process onboarding SLA/due alerts every 15 minutes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'process-onboarding-sla-15min'
  ) THEN
    PERFORM cron.schedule(
      'process-onboarding-sla-15min',
      '*/15 * * * *',
      $$
      select net.http_post(
        url := 'https://ogpiovfxjxcclptfybrk.supabase.co/functions/v1/process-onboarding-sla',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncGlvdmZ4anhjY2xwdGZ5YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTg3NzEsImV4cCI6MjA2OTczNDc3MX0.wWLacGgdAd3tNAKyyigwNK91hvxnP5l4qcPABTQGyqw"}'::jsonb,
        body := '{}'::jsonb
      );
      $$
    );
  END IF;
END $$;