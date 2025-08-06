import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessagingPopup } from '@/components/MessagingPopup';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useProfile } from '@/hooks/useProfile';

export const FloatingMessageButton = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [preSelectedTrainerId, setPreSelectedTrainerId] = useState<string | null>(null);
  const { savedTrainers } = useSavedTrainers();
  const { profile } = useProfile();
  
  const isTrainer = profile?.user_type === 'trainer';
  
  // For trainers, show different badge logic (would be based on unread messages in real app)
  const badgeCount = isTrainer ? 0 : savedTrainers.length;

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