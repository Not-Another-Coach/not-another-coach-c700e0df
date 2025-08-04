-- Create a security definer function to check if client has sent first message
CREATE OR REPLACE FUNCTION public.client_has_sent_first_message(conversation_uuid uuid, client_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.messages 
    WHERE conversation_id = conversation_uuid 
      AND sender_id = client_uuid
  );
END;
$$;

-- Drop and recreate the problematic RLS policy for messages
DROP POLICY IF EXISTS "Users can send messages with restrictions" ON public.messages;

CREATE POLICY "Users can send messages with restrictions" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id 
      AND (
        conversations.client_id = auth.uid() 
        OR (
          conversations.trainer_id = auth.uid() 
          AND public.client_has_sent_first_message(conversations.id, conversations.client_id)
        )
      )
  )
);