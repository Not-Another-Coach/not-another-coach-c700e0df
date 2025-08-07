-- Update the function to implement correct business logic
CREATE OR REPLACE FUNCTION public.auto_update_engagement_on_message_exchange()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  conversation_record RECORD;
  client_messages_count INTEGER;
  trainer_messages_count INTEGER;
  current_engagement RECORD;
  trainer_offers_discovery_calls BOOLEAN DEFAULT false;
BEGIN
  -- Get conversation details
  SELECT * INTO conversation_record
  FROM public.conversations
  WHERE id = NEW.conversation_id;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Get current engagement stage
  SELECT * INTO current_engagement
  FROM public.client_trainer_engagement
  WHERE client_id = conversation_record.client_id
    AND trainer_id = conversation_record.trainer_id;
  
  -- Only proceed if currently shortlisted
  IF NOT FOUND OR current_engagement.stage != 'shortlisted' THEN
    RETURN NEW;
  END IF;
  
  -- Check if trainer offers discovery calls
  SELECT COALESCE(offers_discovery_call, false) INTO trainer_offers_discovery_calls
  FROM public.discovery_call_settings
  WHERE trainer_id = conversation_record.trainer_id;
  
  -- If trainer offers discovery calls, don't auto-progress through messaging
  -- They should progress only when a discovery call is actually booked
  IF trainer_offers_discovery_calls = true THEN
    RETURN NEW;
  END IF;
  
  -- For trainers who don't offer discovery calls, progress based on messaging exchange
  -- Count messages from client
  SELECT COUNT(*) INTO client_messages_count
  FROM public.messages
  WHERE conversation_id = NEW.conversation_id
    AND sender_id = conversation_record.client_id;
  
  -- Count messages from trainer
  SELECT COUNT(*) INTO trainer_messages_count
  FROM public.messages
  WHERE conversation_id = NEW.conversation_id
    AND sender_id = conversation_record.trainer_id;
  
  -- If both parties have sent at least one message, update engagement to discovery_in_progress
  IF client_messages_count >= 1 AND trainer_messages_count >= 1 THEN
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'discovery_in_progress',
      updated_at = now()
    WHERE client_id = conversation_record.client_id
      AND trainer_id = conversation_record.trainer_id;
  END IF;
  
  RETURN NEW;
END;
$function$;