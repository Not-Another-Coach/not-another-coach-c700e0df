-- Update the engagement trigger to allow progression to getting_to_know_your_coach even for trainers offering discovery calls
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
  
  -- If both parties have sent at least one message, update engagement to getting_to_know_your_coach
  -- This allows progression regardless of whether trainer offers discovery calls
  IF client_messages_count >= 1 AND trainer_messages_count >= 1 THEN
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'getting_to_know_your_coach',
      updated_at = now()
    WHERE client_id = conversation_record.client_id
      AND trainer_id = conversation_record.trainer_id;
  END IF;
  
  RETURN NEW;
END;
$function$;