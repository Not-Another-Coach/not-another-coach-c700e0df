import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Users, Clock } from "lucide-react";

interface SaveTrainerPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trainerName: string;
}

export const SaveTrainerPrompt = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  trainerName 
}: SaveTrainerPromptProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Save {trainerName} to your shortlist?</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Keep track of trainers you're interested in. Your saved trainers will be 
            stored locally for 7 days.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Compare multiple trainers easily</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>No time pressure - browse at your own pace</span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Not now
          </Button>
          <Button onClick={onConfirm} className="w-full sm:w-auto">
            <Heart className="h-4 w-4 mr-2" />
            Save Trainer
          </Button>
        </DialogFooter>

        {/* Soft CTA */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Want to keep your shortlist forever?{" "}
            <Button variant="link" className="p-0 h-auto text-xs">
              Create a free account
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};