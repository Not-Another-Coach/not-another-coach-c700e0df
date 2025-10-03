import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        // Get all conversations where the user is either client or trainer
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('id, client_id, trainer_id, client_last_read_at, trainer_last_read_at')
          .or(`client_id.eq.${user.id},trainer_id.eq.${user.id}`);

        if (convError) throw convError;

        if (!conversations || conversations.length === 0) {
          setUnreadCount(0);
          setLoading(false);
          return;
        }

        let totalUnread = 0;

        // For each conversation, count unread messages
        for (const conv of conversations) {
          const isClient = conv.client_id === user.id;
          const lastReadAt = isClient ? conv.client_last_read_at : conv.trainer_last_read_at;
          const otherPartyId = isClient ? conv.trainer_id : conv.client_id;

          // Count messages from the other party that are unread
          const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_id', otherPartyId)
            .gt('created_at', lastReadAt || '1970-01-01');

          if (countError) {
            console.error('Error counting unread messages:', countError);
            continue;
          }

          totalUnread += count || 0;
        }

        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('unread-messages-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Re-fetch count when new message arrives
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          // Re-fetch when conversation read status updates
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { unreadCount, loading };
}
