import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserTypeChecks } from '@/hooks/useUserType';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  client_id: string;
  trainer_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  client_last_read_at: string | null;
  trainer_last_read_at: string | null;
  messages: Message[];
  otherUser?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
  metadata: any;
}

export function useConversations() {
  const { user } = useAuth();
  const { user_type, isClient } = useUserTypeChecks();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch conversations with the other user's profile data
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          messages:messages(*)
        `)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        toast.error('Failed to load conversations');
        return;
      }

      // Fetch profile data for all users involved in conversations
      const userIds = new Set<string>();
      conversationsData?.forEach(conv => {
        userIds.add(conv.client_id);
        userIds.add(conv.trainer_id);
      });

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_url')
        .in('id', Array.from(userIds));

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Map conversations with profile data
      const conversationsWithProfiles = conversationsData?.map(conv => {
        const otherUserId = conv.client_id === user.id ? conv.trainer_id : conv.client_id;
        const otherUser = profiles?.find(p => p.id === otherUserId);
        
        return {
          ...conv,
          otherUser,
          messages: conv.messages?.sort((a: Message, b: Message) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ) || []
        };
      }) || [];

      // Filter out conversations with declined trainers (for clients only)
      let filteredConversations = conversationsWithProfiles;
      if (isClient()) {
        // Get engagement data to filter out declined trainers
        const { data: engagements } = await supabase
          .from('client_trainer_engagement')
          .select('trainer_id, stage')
          .eq('client_id', user.id)
          .eq('stage', 'declined');

        const declinedTrainerIds = new Set(engagements?.map(e => e.trainer_id) || []);
        
        filteredConversations = conversationsWithProfiles.filter(conv => {
          const trainerId = conv.client_id === user.id ? conv.trainer_id : conv.client_id;
          return !declinedTrainerIds.has(trainerId);
        });
      }

      setConversations(filteredConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user, user_type]);

  const createConversation = useCallback(async (trainerId: string) => {
    if (!user) {
      toast.error('Please log in to start a conversation');
      return { error: 'No user logged in' };
    }

    try {
      // First check if conversation already exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', user.id)
        .eq('trainer_id', trainerId)
        .single();

      if (existingConversation) {
        // Conversation already exists, return it
        toast.success('Opening existing conversation');
        return { data: existingConversation };
      }

      // If no existing conversation found, create a new one
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          client_id: user.id,
          trainer_id: trainerId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        if (error.code === '23505') {
          // Race condition - conversation was created between our check and insert
          // Fetch the existing conversation
          const { data: raceConversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('client_id', user.id)
            .eq('trainer_id', trainerId)
            .single();
          
          if (raceConversation) {
            toast.success('Opening existing conversation');
            return { data: raceConversation };
          }
        }
        toast.error('Failed to create conversation');
        return { error };
      }

      // Refresh conversations to show the new one
      fetchConversations();
      toast.success('Conversation started successfully!');
      return { data };
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return { error };
    }
  }, [user, fetchConversations]);

  const sendMessage = useCallback(async (conversationId: string, content: string, messageType: string = 'text') => {
    if (!user) {
      toast.error('Please log in to send messages');
      return { error: 'No user logged in' };
    }

    try {
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

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        return { error };
      }

      // Update the conversation in local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, messages: [...conv.messages, data] }
          : conv
      ));

      // Note: Database trigger will automatically handle engagement stage transitions
      // for trainers who don't offer discovery calls when both parties have exchanged messages

      return { data };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return { error };
    }
  }, [user]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const readField = conversations.find(c => c.id === conversationId)?.client_id === user.id 
        ? 'client_last_read_at' 
        : 'trainer_last_read_at';

      const now = new Date().toISOString();

      // Update individual message read_at timestamps for unread messages
      await supabase
        .from('messages')
        .update({ read_at: now })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      // Update conversation-level read timestamp
      await supabase
        .from('conversations')
        .update({ [readField]: now })
        .eq('id', conversationId);

      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              [readField]: now,
              messages: conv.messages.map(msg => 
                msg.sender_id !== user.id && !msg.read_at
                  ? { ...msg, read_at: now }
                  : msg
              )
            }
          : conv
      ));
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, [user, conversations]);

  const getUnreadCount = useCallback((conversation: Conversation) => {
    if (!user) return 0;

    const isClient = conversation.client_id === user.id;
    const lastReadAt = isClient ? conversation.client_last_read_at : conversation.trainer_last_read_at;
    
    if (!lastReadAt) {
      return conversation.messages.filter(msg => msg.sender_id !== user.id).length;
    }

    return conversation.messages.filter(msg => 
      msg.sender_id !== user.id && 
      new Date(msg.created_at) > new Date(lastReadAt)
    ).length;
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Set up real-time subscriptions for messages and conversation updates
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
    refetchConversations: fetchConversations
  };
}