-- Add reminder tracking fields to discovery_calls table
ALTER TABLE public.discovery_calls 
ADD COLUMN reminder_24h_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN reminder_1h_sent TIMESTAMP WITH TIME ZONE;

-- Create email notifications table for tracking all sent emails
CREATE TABLE public.discovery_call_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discovery_call_id UUID NOT NULL REFERENCES public.discovery_calls(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('confirmation', 'reminder_24h', 'reminder_1h', 'trainer_new_booking', 'trainer_cancellation', 'trainer_reschedule')),
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_id TEXT, -- Resend email ID for tracking
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE public.discovery_call_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications table
CREATE POLICY "Users can view their own discovery call notifications"
ON public.discovery_call_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.discovery_calls dc
    WHERE dc.id = discovery_call_notifications.discovery_call_id
    AND (dc.client_id = auth.uid() OR dc.trainer_id = auth.uid())
  )
);

CREATE POLICY "System can insert notifications"
ON public.discovery_call_notifications
FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_discovery_call_notifications_call_id ON public.discovery_call_notifications(discovery_call_id);
CREATE INDEX idx_discovery_call_notifications_type ON public.discovery_call_notifications(notification_type);
CREATE INDEX idx_discovery_call_notifications_sent_at ON public.discovery_call_notifications(sent_at);

-- Enable pg_cron extension for scheduled reminders
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the reminder processor to run every 15 minutes
SELECT cron.schedule(
  'process-discovery-call-reminders',
  '*/15 * * * *', -- every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://ogpiovfxjxcclptfybrk.supabase.co/functions/v1/process-discovery-call-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncGlvdmZ4anhjY2xwdGZ5YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTg3NzEsImV4cCI6MjA2OTczNDc3MX0.wWLacGgdAd3tNAKyyigwNK91hvxnP5l4qcPABTQGyqw"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);