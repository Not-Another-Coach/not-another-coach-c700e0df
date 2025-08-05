-- Fix function search path security warnings by setting search_path for existing functions
CREATE OR REPLACE FUNCTION public.schedule_feedback_reminder()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only schedule if discovery call is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.discovery_call_feedback_notifications (
      discovery_call_id,
      client_id,
      notification_type,
      scheduled_for
    )
    VALUES (
      NEW.id,
      NEW.client_id,
      'feedback_reminder',
      NEW.updated_at + INTERVAL '24 hours'
    );
  END IF;
  
  RETURN NEW;
END;
$$;