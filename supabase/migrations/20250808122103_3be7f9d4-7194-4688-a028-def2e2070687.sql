-- Add 'waitlist' to the engagement_stage enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'waitlist' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'engagement_stage')
    ) THEN
        ALTER TYPE engagement_stage ADD VALUE 'waitlist';
    END IF;
END $$;

-- Function to handle waitlist joining - updates engagement stage
CREATE OR REPLACE FUNCTION public.handle_waitlist_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When someone joins a waitlist, update their engagement stage to 'waitlist'
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    INSERT INTO public.client_trainer_engagement (client_id, trainer_id, stage)
    VALUES (NEW.client_id, NEW.coach_id, 'waitlist')
    ON CONFLICT (client_id, trainer_id)
    DO UPDATE SET 
      stage = 'waitlist',
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Function to handle waitlist removal - reverts to shortlisted and sends notification
CREATE OR REPLACE FUNCTION public.handle_waitlist_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  client_name TEXT;
  coach_name TEXT;
BEGIN
  -- When someone leaves/is removed from waitlist, revert to shortlisted
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active') THEN
    -- Use OLD for DELETE operations, NEW for UPDATE operations
    DECLARE
      target_client_id UUID := COALESCE(OLD.client_id, NEW.client_id);
      target_coach_id UUID := COALESCE(OLD.coach_id, NEW.coach_id);
    BEGIN
      -- Update engagement stage back to shortlisted
      UPDATE public.client_trainer_engagement
      SET 
        stage = 'shortlisted',
        updated_at = now()
      WHERE client_id = target_client_id 
        AND trainer_id = target_coach_id
        AND stage = 'waitlist';
      
      -- Get client and coach names for notification
      SELECT COALESCE(first_name || ' ' || last_name, 'A client') INTO client_name
      FROM public.profiles 
      WHERE id = target_client_id;
      
      SELECT COALESCE(first_name || ' ' || last_name, 'Coach') INTO coach_name
      FROM public.profiles 
      WHERE id = target_coach_id;
      
      -- Send notification to trainer about client leaving waitlist
      INSERT INTO public.alerts (
        alert_type,
        title,
        content,
        target_audience,
        metadata,
        is_active
      )
      VALUES (
        'waitlist_left',
        'Client Left Waitlist',
        client_name || ' has left your waitlist and moved back to prospects',
        jsonb_build_object('coaches', jsonb_build_array(target_coach_id)),
        jsonb_build_object(
          'client_id', target_client_id,
          'coach_id', target_coach_id,
          'previous_stage', 'waitlist',
          'new_stage', 'shortlisted'
        ),
        true
      );
    END;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create triggers for waitlist management
DROP TRIGGER IF EXISTS trigger_waitlist_join ON public.coach_waitlists;
CREATE TRIGGER trigger_waitlist_join
  AFTER INSERT ON public.coach_waitlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_waitlist_join();

DROP TRIGGER IF EXISTS trigger_waitlist_removal ON public.coach_waitlists;
CREATE TRIGGER trigger_waitlist_removal
  AFTER UPDATE OR DELETE ON public.coach_waitlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_waitlist_removal();

-- Function to check if client is on trainer's waitlist
CREATE OR REPLACE FUNCTION public.is_client_on_waitlist(p_client_id uuid, p_trainer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.coach_waitlists 
    WHERE client_id = p_client_id 
      AND coach_id = p_trainer_id 
      AND status = 'active'
  );
END;
$function$;

-- Update the existing create_waitlist_notification function to handle the new engagement stage
CREATE OR REPLACE FUNCTION public.create_waitlist_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
      'client_goals', NEW.client_goals,
      'engagement_stage', 'waitlist'
    ),
    true
  );
  
  RETURN NEW;
END;
$function$;