-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.schedule_waitlist_follow_up()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule follow-up interaction when someone joins waitlist
  IF TG_OP = 'INSERT' AND NEW.estimated_start_date IS NOT NULL THEN
    INSERT INTO public.waitlist_interactions (
      waitlist_id,
      interaction_type,
      message,
      scheduled_for
    )
    SELECT 
      NEW.id,
      'auto_scheduled',
      'Automated follow-up reminder for coach',
      NEW.estimated_start_date - INTERVAL '14 days'
    WHERE NEW.estimated_start_date > CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';