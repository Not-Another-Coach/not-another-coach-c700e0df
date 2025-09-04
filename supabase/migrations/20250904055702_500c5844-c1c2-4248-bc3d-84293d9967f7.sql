-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS verification_status_change_notification ON trainer_verification_checks;

-- Create trigger to send notification emails when verification status changes
CREATE OR REPLACE FUNCTION public.notify_verification_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only trigger on actual status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Call edge function to send email (fire and forget)
    PERFORM net.http_post(
      url := 'https://ogpiovfxjxcclptfybrk.supabase.co/functions/v1/send-verification-emails',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncGlvdmZ4anhjY2xwdGZ5YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTg3NzEsImV4cCI6MjA2OTczNDc3MX0.wWLacGgdAd3tNAKyyigwNK91hvxnP5l4qcPABTQGyqw"}'::jsonb,
      body := json_build_object(
        'type', 'status_update',
        'trainer_id', NEW.trainer_id,
        'data', json_build_object(
          'status', NEW.status,
          'check_type', NEW.check_type,
          'admin_notes', NEW.admin_notes,
          'rejection_reason', NEW.rejection_reason
        )
      )::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for verification check status changes
CREATE TRIGGER verification_status_change_notification
  AFTER UPDATE ON trainer_verification_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_verification_status_change();