import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, Users } from 'lucide-react';

interface WaitlistExclusivePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (offerToWaitlist: boolean) => void;
  waitlistCount: number;
  trainerName: string;
}

export function WaitlistExclusivePrompt({
  isOpen,
  onClose,
  onConfirm,
  waitlistCount,
  trainerName
}: WaitlistExclusivePromptProps) {
  const handleOfferToWaitlist = () => {
    onConfirm(true);
    onClose();
  };

  const handleMakePublic = () => {
    onConfirm(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            You have {waitlistCount} client{waitlistCount !== 1 ? 's' : ''} waiting
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Would you like to offer this new availability slot to your waitlist clients first?
            </p>
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Clock className="w-4 h-4" />
                48-Hour Exclusive Access
              </div>
              <p className="text-sm text-muted-foreground">
                Your waitlist clients will have 48 hours to book before this becomes available to all clients.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleMakePublic}>
            No, make available to everyone now
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleOfferToWaitlist}>
            Yes, offer to waitlist first
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}