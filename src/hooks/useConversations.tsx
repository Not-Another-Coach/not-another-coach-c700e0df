import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useConversationsData, Conversation, Message } from '@/hooks/data/useConversationsData';

export type { Conversation, Message } from '@/hooks/data/useConversationsData';

/**
 * Logic hook for conversation operations
 * Consumes useConversationsData for data and adds mutations + real-time subscriptions
 */
export function useConversations() {
  const { user } = useAuth();
  const { conversations: cachedConversations, loading, refetch } = useConversationsData();
  const queryClient = useQueryClient();
  
  // Local state for real-time updates (synced with cache)
  const [conversations, setConversations] = useState<Conversation[]>(cachedConversations);

  // Sync local state with cached data
  useEffect(() => {
    setConversations(cachedConversations);
  }, [cachedConversations]);

  const createConversationMutation = useMutation({
    mutationFn: async (trainerId: string) => {
      if (!user) throw new Error('No user logged in');

      // Check if conversation exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', user.id)
        .eq('trainer_id', trainerId)
        .single();

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          client_id: user.id,
          trainer_id: trainerId
        })
        .select()
        .single();

      if (error) {
        // Handle race condition
        if (error.code === '23505') {
          const { data: raceConversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('client_id', user.id)
            .eq('trainer_id', trainerId)
            .single();
          
          if (raceConversation) return raceConversation;
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      toast.success('Conversation started successfully!');
    },
    onError: () => {
      toast.error('Failed to create conversation');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, messageType = 'text' }: { 
      conversationId: string; 
      content: string; 
      messageType?: string;
    }) => {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Optimistic update to local state
      setConversations(prev => prev.map(conv => 
        conv.id === variables.conversationId 
          ? { ...conv, messages: [...conv.messages, data as Message] }
          : conv
      ));
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('No user');

      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) throw new Error('Conversation not found');

      const readField = conversation.client_id === user.id 
        ? 'client_last_read_at' 
        : 'trainer_last_read_at';

      const now = new Date().toISOString();

      // Update message read timestamps
      await supabase
        .from('messages')
        .update({ read_at: now })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      // Update conversation read timestamp
      await supabase
        .from('conversations')
        .update({ [readField]: now })
        .eq('id', conversationId);

      return { conversationId, readField, now };
    },
    onSuccess: ({ conversationId, readField, now }) => {
      // Optimistic update to local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              [readField]: now,
              messages: conv.messages.map(msg => 
                msg.sender_id !== user?.id && !msg.read_at
                  ? { ...msg, read_at: now }
                  : msg
              )
            }
          : conv
      ));
    },
  });

  const createConversation = useCallback(async (trainerId: string) => {
    try {
      const data = await createConversationMutation.mutateAsync(trainerId);
      return { data };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { error };
    }
  }, [createConversationMutation]);

  const sendMessage = useCallback(async (conversationId: string, content: string, messageType: string = 'text') => {
    try {
      const data = await sendMessageMutation.mutateAsync({ conversationId, content, messageType });
      return { data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error };
    }
  }, [sendMessageMutation]);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(conversationId);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, [markAsReadMutation]);

  const getUnreadCount = useCallback((conversation: Conversation) => {
    if (!user) return 0;
    return conversation.messages.filter(msg => 
      msg.sender_id !== user.id && !msg.read_at
    ).length;
  }, [user]);

  // Real-time subscriptions for messages and conversation updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-and-conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setConversations(prev => prev.map(conv => 
            conv.id === newMessage.conversation_id
              ? { ...conv, messages: [...conv.messages, newMessage] }
              : conv
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          const updatedConv = payload.new as any;
          setConversations(prev => prev.map(conv => 
            conv.id === updatedConv.id
              ? { 
                  ...conv, 
                  client_last_read_at: updatedConv.client_last_read_at,
                  trainer_last_read_at: updatedConv.trainer_last_read_at
                }
              : conv
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setConversations(prev => prev.map(conv => 
            conv.id === updatedMessage.conversation_id
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === updatedMessage.id ? updatedMessage : msg
                  )
                }
              : conv
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    conversations,
    loading,
    createConversation,
    sendMessage,
    markAsRead,
    getUnreadCount,
    refetchConversations: refetch
  };
}
