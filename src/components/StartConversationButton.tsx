import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { useShortlistedTrainers } from '@/hooks/useShortlistedTrainers';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface StartConversationButtonProps {
  trainerId: string;
  trainerName?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function StartConversationButton({ 
  trainerId, 
  trainerName,
  variant = 'default',
  size = 'default',
  className 
}: StartConversationButtonProps) {
  const { user } = useAuth();
  const { createConversation, conversations } = useConversations();
  const { isShortlisted } = useShortlistedTrainers();

  // Check if conversation already exists
  const existingConversation = conversations.find(conv => 
    (conv.client_id === user?.id && conv.trainer_id === trainerId) ||
    (conv.trainer_id === user?.id && conv.client_id === trainerId)
  );

  // Check if trainer is shortlisted (only required for clients)
  const trainerIsShortlisted = isShortlisted(trainerId);

  const handleStartConversation = async () => {
    if (!user) {
      toast.error('Please log in to start a conversation');
      return;
    }

    // If conversation already exists, show message
    if (existingConversation) {
      toast.info('Conversation already exists with this trainer');
      return;
    }

    // Check if trainer is shortlisted (for clients)
    if (user && !trainerIsShortlisted) {
      toast.error('You can only message trainers you have shortlisted');
      return;
    }

    // Create the conversation
    const result = await createConversation(trainerId);
    if (!result.error) {
      toast.success(`Conversation started with ${trainerName || 'trainer'}!`);
    }
  };

  // Don't show button if conversation already exists
  if (existingConversation) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        disabled
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Already Messaging
      </Button>
    );
  }

  // Don't show button if trainer is not shortlisted (for clients)
  if (user && !trainerIsShortlisted) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        disabled
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Shortlist to Message
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleStartConversation}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Start Conversation
    </Button>
  );
}