-- Create function to generate waitlist notification
CREATE OR REPLACE FUNCTION public.create_waitlist_notification()
RETURNS TRIGGER AS $$
DECLARE
  client_name TEXT;
  coach_name TEXT;
BEGIN
  -- Get client and coach names from profiles
  SELECT COALESCE(first_name || ' ' || last_name, 'Client') INTO client_name
  FROM public.profiles 
  WHERE id = NEW.client_id;
  
  SELECT COALESCE(first_name || ' ' || last_name, 'Coach') INTO coach_name
  FROM public.profiles 
  WHERE id = NEW.coach_id;
  
  -- Create alert for the coach
  INSERT INTO public.alerts (
    alert_type,
    title,
    content,
    created_by,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'waitlist_joined',
    'New Client Joined Your Waitlist',
    client_name || ' has joined your waitlist' || 
    CASE 
      WHEN NEW.client_goals IS NOT NULL AND NEW.client_goals != '' 
      THEN ' with goals: ' || NEW.client_goals 
      ELSE ''
    END,
    NEW.coach_id, -- Set the coach as the target
    jsonb_build_object('coaches', jsonb_build_array(NEW.coach_id)),
    jsonb_build_object(
      'client_id', NEW.client_id,
      'coach_id', NEW.coach_id,
      'waitlist_entry_id', NEW.id,
      'estimated_start_date', NEW.estimated_start_date,
      'client_goals', NEW.client_goals
    ),
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on coach_waitlists for INSERT
CREATE TRIGGER create_waitlist_notification_trigger
  AFTER INSERT ON public.coach_waitlists
  FOR EACH ROW
  EXECUTE FUNCTION public.create_waitlist_notification();