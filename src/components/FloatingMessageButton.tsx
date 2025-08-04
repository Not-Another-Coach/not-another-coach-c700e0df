import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessagingPopup } from '@/components/MessagingPopup';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';

export const FloatingMessageButton = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { savedTrainers } = useSavedTrainers();

  return (
    <>
      <Button
        onClick={() => setIsPopupOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
        {savedTrainers.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {savedTrainers.length}
          </Badge>
        )}
      </Button>

      <MessagingPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};