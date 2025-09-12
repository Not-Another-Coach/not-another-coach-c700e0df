import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface UserIntentModalProps {
  isOpen: boolean;
  onSelectIntent: (intent: 'client' | 'trainer') => void;
  onDismiss: () => void;
}

export function UserIntentModal({ isOpen, onSelectIntent, onDismiss }: UserIntentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="text-center py-6">
          <h2 className="text-xl font-semibold mb-6">
            How can we help you today?
          </h2>
          
          <div className="space-y-4">
            <Button
              onClick={() => onSelectIntent('client')}
              className="w-full h-14 text-lg font-semibold rounded-xl"
              size="lg"
            >
              Find a Coach
            </Button>
            
            <Button
              onClick={() => onSelectIntent('trainer')}
              variant="outline"
              className="w-full h-14 text-lg font-semibold rounded-xl border-2"
              size="lg"
            >
              I'm a Coach
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}