-- Fix engagement flow: Update message exchange trigger to support getting_to_know_your_coach stage
CREATE OR REPLACE FUNCTION public.auto_update_engagement_on_message_exchange()
RETURNS TRIGGER AS $$
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
  
  -- Check if trainer offers discovery calls
  SELECT offers_discovery_call INTO trainer_offers_discovery
  FROM profiles
  WHERE id = conversation_record.trainer_id;
  
  -- Count messages from each party
  SELECT COUNT(*) INTO client_message_count
  FROM messages
  WHERE conversation_id = NEW.conversation_id
    AND sender_id = conversation_record.client_id;
    
  SELECT COUNT(*) INTO trainer_message_count
  FROM messages
  WHERE conversation_id = NEW.conversation_id
    AND sender_id = conversation_record.trainer_id;
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update discovery call booking trigger to use getting_to_know_your_coach stage
CREATE OR REPLACE FUNCTION public.update_engagement_on_discovery_call_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- When a discovery call is created (booked), update engagement to getting_to_know_your_coach
  IF TG_OP = 'INSERT' THEN
    -- Update engagement stage for any stage except 'active_client'
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'getting_to_know_your_coach', 
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id 
      AND stage NOT IN ('active_client', 'discovery_completed', 'getting_to_know_your_coach');
    
    RAISE NOTICE 'Discovery call booked: moved to getting_to_know_your_coach for client % trainer %', 
      NEW.client_id, NEW.trainer_id;
  END IF;
  
  -- When a discovery call is completed, update engagement to discovery_completed
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'discovery_completed', 
      discovery_completed_at = now(),
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id;
      
    RAISE NOTICE 'Discovery call completed: moved to discovery_completed for client % trainer %', 
      NEW.client_id, NEW.trainer_id;
  END IF;
  
  -- When a discovery call is cancelled, revert engagement stage to getting_to_know_your_coach
  IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'getting_to_know_your_coach',
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id
      AND stage = 'getting_to_know_your_coach';
      
    RAISE NOTICE 'Discovery call cancelled: reverted to getting_to_know_your_coach for client % trainer %', 
      NEW.client_id, NEW.trainer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix create_coach_selection_request to not downgrade engagement stage
CREATE OR REPLACE FUNCTION public.create_coach_selection_request(
  p_trainer_id uuid,
  p_package_id text,
  p_package_name text,
  p_package_price numeric,
  p_package_duration text,
  p_client_message text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  request_id UUID;
  current_user_id UUID;
  current_stage engagement_stage;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create selection request';
  END IF;
  
  -- Get current engagement stage
  SELECT stage INTO current_stage
  FROM public.client_trainer_engagement
  WHERE client_id = current_user_id AND trainer_id = p_trainer_id;
  
  -- Insert the selection request
  INSERT INTO public.coach_selection_requests (
    client_id,
    trainer_id,
    package_id,
    package_name,
    package_price,
    package_duration,
    client_message
  )
  VALUES (
    current_user_id,
    p_trainer_id,
    p_package_id,
    p_package_name,
    p_package_price,
    p_package_duration,
    p_client_message
  )
  ON CONFLICT (client_id, trainer_id)
  DO UPDATE SET
    package_id = EXCLUDED.package_id,
    package_name = EXCLUDED.package_name,
    package_price = EXCLUDED.package_price,
    package_duration = EXCLUDED.package_duration,
    client_message = EXCLUDED.client_message,
    status = 'pending',
    trainer_response = NULL,
    suggested_alternative_package_id = NULL,
    suggested_alternative_package_name = NULL,
    suggested_alternative_package_price = NULL,
    responded_at = NULL,
    updated_at = now()
  RETURNING id INTO request_id;

  -- DO NOT downgrade engagement stage - keep it as is
  -- The stage should already be discovery_completed or discovery_in_progress at this point
  -- Removed the incorrect line that was setting stage to 'shortlisted'

  RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;