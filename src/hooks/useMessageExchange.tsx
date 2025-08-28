import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useMessageExchange(trainerId: string) {
  const { user } = useAuth();
  const [hasExchangedMessages, setHasExchangedMessages] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMessageExchange = async () => {
      if (!user || !trainerId) {
        setLoading(false);
        return;
      }

      try {
        // Find conversation between current user and trainer
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('client_id', user.id)
          .eq('trainer_id', trainerId)
          .single();

        if (convError || !conversation) {
          setHasExchangedMessages(false);
          setLoading(false);
          return;
        }

        // Count messages from both client and trainer
        const { data: clientMessages, error: clientError } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conversation.id)
          .eq('sender_id', user.id);

        const { data: trainerMessages, error: trainerError } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conversation.id)
          .eq('sender_id', trainerId);

        if (clientError || trainerError) {
          console.error('Error checking messages:', clientError || trainerError);
          setHasExchangedMessages(false);
          setLoading(false);
          return;
        }

        // Both parties have sent at least one message
        const hasExchange = (clientMessages?.length || 0) >= 1 && (trainerMessages?.length || 0) >= 1;
        setHasExchangedMessages(hasExchange);
        
      } catch (error) {
        console.error('Error checking message exchange:', error);
        setHasExchangedMessages(false);
      } finally {
        setLoading(false);
      }
    };

    checkMessageExchange();
  }, [user, trainerId]);

  return {
    hasExchangedMessages,
    loading
  };
}