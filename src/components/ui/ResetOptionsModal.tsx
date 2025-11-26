import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserIntent } from "@/hooks/useUserIntent";
import { RefreshCw, RotateCcw } from "lucide-react";

interface ResetOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetOptionsModal = ({ isOpen, onClose }: ResetOptionsModalProps) => {
  const { clearIntent, userIntent } = useUserIntent();

  const handleIntentOnlyReset = () => {
    clearIntent();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Reset Options
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Current status:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={userIntent ? "default" : "secondary"}>
                {userIntent ? `Looking as ${userIntent}` : "No intent set"}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <RotateCcw className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">Change Intent</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Switch between looking as a client or trainer
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleIntentOnlyReset}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Change Intent
              </Button>
            </div>
          </div>

          <Button onClick={onClose} variant="ghost" className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
