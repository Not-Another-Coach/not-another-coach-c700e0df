import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UserIntentModalProps {
  isOpen: boolean;
  onSelectIntent: (intent: 'client' | 'trainer') => void;
  onDismiss: () => void;
}

export function UserIntentModal({ isOpen, onSelectIntent, onDismiss }: UserIntentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
        <div className="text-center py-6">
          <DialogTitle className="text-2xl font-bold mb-4">
            How can we help you today?
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose whether you want to find a coach or you are a coach.
          </DialogDescription>
          
          <div className="space-y-4">
            <Button
              onClick={() => onSelectIntent('client')}
              className="w-full h-14 text-lg font-semibold rounded-xl"
              size="lg"
            >
              Find a Coach
            </Button>
            
            <Button asChild variant="outline" className="w-full h-14 text-lg font-semibold rounded-xl border-2" size="lg">
              <Link to="/trainer/demo" onClick={() => onSelectIntent('trainer')}>I'm a Coach</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}