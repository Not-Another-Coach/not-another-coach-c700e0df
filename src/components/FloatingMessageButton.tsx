import React, { useState, useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessagingPopup } from '@/components/MessagingPopup';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useProfileByType } from '@/hooks/useProfileByType';
import { useConversations } from '@/hooks/useConversations';

export const FloatingMessageButton = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [preSelectedTrainerId, setPreSelectedTrainerId] = useState<string | null>(null);
  const { savedTrainers } = useSavedTrainers();
  const { profile } = useProfileByType();
  const { conversations } = useConversations();
  
  const isTrainer = profile?.user_type === 'trainer';
  
  // Calculate unread messages count
  const unreadCount = useMemo(() => {
    if (isTrainer) {
      // For trainers, count messages sent after trainer_last_read_at
      return conversations.reduce((count, conv) => {
        const lastReadAt = conv.trainer_last_read_at;
        
        if (!conv.messages || conv.messages.length === 0) return count;
        
        // If never read, count all messages from the other person (client)
        if (!lastReadAt) {
          const unreadInConv = conv.messages.filter(msg => 
            msg.sender_id !== profile?.id
          ).length;
          return count + unreadInConv;
        }
        
        // Count messages after last read time
        const unreadInConv = conv.messages.filter(msg => 
          new Date(msg.created_at) > new Date(lastReadAt) && 
          msg.sender_id !== profile?.id
        ).length;
        
        return count + unreadInConv;
      }, 0);
    } else {
      // For clients, count messages sent after client_last_read_at
      return conversations.reduce((count, conv) => {
        const lastReadAt = conv.client_last_read_at;
        
        if (!conv.messages || conv.messages.length === 0) return count;
        
        // If never read, count all messages from the other person (trainer)
        if (!lastReadAt) {
          const unreadInConv = conv.messages.filter(msg => 
            msg.sender_id !== profile?.id
          ).length;
          return count + unreadInConv;
        }
        
        // Count messages after last read time
        const unreadInConv = conv.messages.filter(msg => 
          new Date(msg.created_at) > new Date(lastReadAt) && 
          msg.sender_id !== profile?.id
        ).length;
        
        return count + unreadInConv;
      }, 0);
    }
  }, [conversations, isTrainer, profile?.id]);
  
  const badgeCount = unreadCount;

  // Listen for global message events to open popup with specific trainer
  React.useEffect(() => {
    const handleMessageEvent = (event: CustomEvent) => {
      console.log('🔥 FloatingMessageButton received openMessagePopup event:', event.detail);
      setPreSelectedTrainerId(event.detail.trainerId);
      setIsPopupOpen(true);
      console.log('🔥 FloatingMessageButton setting popup open to true');
    };

    console.log('🔥 FloatingMessageButton adding event listener for openMessagePopup');
    window.addEventListener('openMessagePopup', handleMessageEvent as EventListener);
    
    return () => {
      console.log('🔥 FloatingMessageButton removing event listener');
      window.removeEventListener('openMessagePopup', handleMessageEvent as EventListener);
    };
  }, []);

  return (
    <>
      <Button
        data-messaging-button
        aria-label="Open messages"
        title="Open messages"
        onClick={() => {
          console.log('🔥 FloatingMessageButton clicked directly');
          setIsPopupOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
        {badgeCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {badgeCount}
          </Badge>
        )}
      </Button>

      <MessagingPopup
        isOpen={isPopupOpen}
        onClose={() => {
          console.log('🔥 MessagingPopup closing');
          setIsPopupOpen(false);
          setPreSelectedTrainerId(null);
        }}
        preSelectedTrainerId={preSelectedTrainerId}
      />
    </>
  );
};