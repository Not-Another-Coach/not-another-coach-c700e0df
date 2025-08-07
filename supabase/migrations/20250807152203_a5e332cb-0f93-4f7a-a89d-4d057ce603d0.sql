-- Create stored procedure for admin cleanup of client-trainer interactions
CREATE OR REPLACE FUNCTION public.admin_cleanup_client_trainer_interactions(
  p_client_id uuid,
  p_trainer_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_counts jsonb := '{}';
  temp_count integer;
BEGIN
  -- Only allow admins to run this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can cleanup interactions';
  END IF;

  -- Delete messages in their conversations
  DELETE FROM public.messages 
  WHERE conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{messages}', to_jsonb(temp_count));

  -- Delete conversations between them
  DELETE FROM public.conversations 
  WHERE client_id = p_client_id AND trainer_id = p_trainer_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{conversations}', to_jsonb(temp_count));

  -- Delete discovery call feedback responses
  DELETE FROM public.discovery_call_feedback_responses 
  WHERE client_id = p_client_id AND trainer_id = p_trainer_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{feedback_responses}', to_jsonb(temp_count));

  -- Delete discovery call feedback
  DELETE FROM public.discovery_call_feedback 
  WHERE client_id = p_client_id AND trainer_id = p_trainer_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{feedback}', to_jsonb(temp_count));

  -- Delete discovery call notifications
  DELETE FROM public.discovery_call_notifications 
  WHERE discovery_call_id IN (
    SELECT id FROM public.discovery_calls 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{call_notifications}', to_jsonb(temp_count));

  -- Delete discovery call feedback notifications
  DELETE FROM public.discovery_call_feedback_notifications 
  WHERE client_id = p_client_id 
  AND discovery_call_id IN (
    SELECT id FROM public.discovery_calls 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{feedback_notifications}', to_jsonb(temp_count));

  -- Delete discovery call notes
  DELETE FROM public.discovery_call_notes 
  WHERE client_id = p_client_id AND trainer_id = p_trainer_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{call_notes}', to_jsonb(temp_count));

  -- Delete discovery calls
  DELETE FROM public.discovery_calls 
  WHERE client_id = p_client_id AND trainer_id = p_trainer_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{discovery_calls}', to_jsonb(temp_count));

  -- Delete coach selection requests
  DELETE FROM public.coach_selection_requests 
  WHERE client_id = p_client_id AND trainer_id = p_trainer_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{selection_requests}', to_jsonb(temp_count));

  -- Delete waitlist entries
  DELETE FROM public.coach_waitlists 
  WHERE client_id = p_client_id AND coach_id = p_trainer_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{waitlist_entries}', to_jsonb(temp_count));

  -- Delete alerts related to their interactions
  DELETE FROM public.alerts 
  WHERE (metadata->>'client_id' = p_client_id::text 
         AND metadata->>'trainer_id' = p_trainer_id::text)
     OR (metadata->>'client_id' = p_client_id::text 
         AND metadata->>'coach_id' = p_trainer_id::text);
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{alerts}', to_jsonb(temp_count));

  -- Delete the client-trainer engagement record
  DELETE FROM public.client_trainer_engagement 
  WHERE client_id = p_client_id AND trainer_id = p_trainer_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := jsonb_set(deleted_counts, '{engagement_records}', to_jsonb(temp_count));

  -- Log the admin action
  PERFORM public.log_admin_action(
    p_client_id,
    'cleanup_interactions',
    jsonb_build_object(
      'target_trainer_id', p_trainer_id,
      'deleted_counts', deleted_counts
    ),
    'Admin cleanup of all client-trainer interactions'
  );

  RETURN deleted_counts;
END;
$function$;