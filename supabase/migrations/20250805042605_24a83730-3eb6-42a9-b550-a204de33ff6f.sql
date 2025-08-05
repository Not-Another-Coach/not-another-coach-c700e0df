-- Enable real-time functionality for the alerts table
ALTER TABLE public.alerts REPLICA IDENTITY FULL;

-- Add the alerts table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;