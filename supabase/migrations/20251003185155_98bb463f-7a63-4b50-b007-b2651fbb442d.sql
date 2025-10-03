-- Fix the auto_update_engagement_on_message_exchange trigger function
-- to query offers_discovery_call from the correct table

CREATE OR REPLACE FUNCTION public.auto_update_engagement_on_message_exchange()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conversation_record RECORD;
  client_message_count INTEGER;
  trainer_message_count INTEGER;
  current_stage engagement_stage;
  trainer_offers_discovery BOOLEAN;
BEGIN
  -- Get conversation details
  SELECT * INTO conversation_record
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  -- Get current engagement stage
  SELECT stage INTO current_stage
  FROM client_trainer_engagement
  WHERE client_id = conversation_record.client_id
    AND trainer_id = conversation_record.trainer_id;
  
  -- Check if trainer offers discovery calls from the correct table
  SELECT COALESCE(offers_discovery_call, false) INTO trainer_offers_discovery
  FROM discovery_call_settings
  WHERE trainer_id = conversation_record.trainer_id;
  
  -- Default to false if no settings found
  IF trainer_offers_discovery IS NULL THEN
    trainer_offers_discovery := false;
  END IF;
  
  -- Count messages from each party
  SELECT COUNT(*) INTO client_message_count
  FROM messages
  WHERE conversation_id = NEW.conversation_id
    AND sender_id = conversation_record.client_id;
    
  SELECT COUNT(*) INTO trainer_message_count
  FROM messages
  WHERE conversation_id = NEW.conversation_id
    AND sender_id = conversation_record.trainer_id;
  
  RAISE NOTICE 'Message exchange trigger - Client messages: %, Trainer messages: %, Current stage: %, Offers discovery: %', 
    client_message_count, trainer_message_count, current_stage, trainer_offers_discovery;
  
  -- If trainer does NOT offer discovery calls and both parties sent at least 1 message
  IF NOT trainer_offers_discovery AND client_message_count >= 1 AND trainer_message_count >= 1 THEN
    -- Move from shortlisted or getting_to_know_your_coach to discovery_completed
    IF current_stage IN ('shortlisted', 'getting_to_know_your_coach') THEN
      UPDATE client_trainer_engagement
      SET stage = 'discovery_completed',
          discovery_completed_at = now(),
          updated_at = now()
      WHERE client_id = conversation_record.client_id
        AND trainer_id = conversation_record.trainer_id;
        
      RAISE NOTICE 'Message exchange complete: moved to discovery_completed for client % trainer %', 
        conversation_record.client_id, conversation_record.trainer_id;
    END IF;
  END IF;
  
  -- If this is the first message from client, move from shortlisted to getting_to_know_your_coach
  IF NEW.sender_id = conversation_record.client_id AND client_message_count = 1 THEN
    IF current_stage = 'shortlisted' THEN
      UPDATE client_trainer_engagement
      SET stage = 'getting_to_know_your_coach',
          updated_at = now()
      WHERE client_id = conversation_record.client_id
        AND trainer_id = conversation_record.trainer_id;
        
      RAISE NOTICE 'First client message: moved to getting_to_know_your_coach for client % trainer %',
        conversation_record.client_id, conversation_record.trainer_id;
    END IF;
  END IF;
  
  -- If trainer offers discovery calls and both parties exchanged messages
  -- Move from getting_to_know_your_coach to discovery_completed (message exchange complete)
  IF trainer_offers_discovery AND client_message_count >= 1 AND trainer_message_count >= 1 THEN
    IF current_stage = 'getting_to_know_your_coach' THEN
      UPDATE client_trainer_engagement
      SET stage = 'discovery_completed',
          discovery_completed_at = now(),
          updated_at = now()
      WHERE client_id = conversation_record.client_id
        AND trainer_id = conversation_record.trainer_id;
        
      RAISE NOTICE 'Message exchange complete (discovery trainer): moved to discovery_completed for client % trainer %',
        conversation_record.client_id, conversation_record.trainer_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;