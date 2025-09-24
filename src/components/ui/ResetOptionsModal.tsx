import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserIntent } from "@/hooks/useUserIntent";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { RefreshCw, RotateCcw, Trash2, AlertTriangle } from "lucide-react";

interface ResetOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetOptionsModal = ({ isOpen, onClose }: ResetOptionsModalProps) => {
  const { clearIntent, resetIntentAndCreateNewSession, userIntent } = useUserIntent();
  const { session } = useAnonymousSession();

  const handleIntentOnlyReset = () => {
    clearIntent();
    onClose();
  };

  const handleCompleteReset = () => {
    resetIntentAndCreateNewSession();
    onClose();
  };

  const hasSavedData = session && (
    (session.savedTrainers && session.savedTrainers.length > 0) || 
    session.quizResults
  );

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
              {hasSavedData && (
                <Badge variant="outline">
                  {session?.savedTrainers?.length || 0} saved trainers
                </Badge>
              )}
              {session?.quizResults && (
                <Badge variant="outline">Quiz completed</Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Option 1: Just reset intent */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <RotateCcw className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">Change Intent Only</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Switch between looking as a client or trainer while keeping your saved trainers and quiz results
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 text-green-600">
                  <span>✓</span> Keeps saved trainers ({session?.savedTrainers?.length || 0})
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <span>✓</span> Keeps quiz results {session?.quizResults ? '(completed)' : '(none)'}
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <span>→</span> Resets client/trainer preference
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

            {/* Option 2: Complete fresh start */}
            <div className="border border-destructive/20 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 mt-0.5 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">Complete Fresh Start</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clear everything and start over with a new anonymous session
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 text-destructive">
                  <span>✗</span> Removes all saved trainers ({session?.savedTrainers?.length || 0})
                </div>
                <div className="flex items-center gap-1 text-destructive">
                  <span>✗</span> Clears quiz results {session?.quizResults ? '(completed)' : '(none)'}
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <span>→</span> Creates new anonymous session
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <span>→</span> Resets client/trainer preference
                </div>
              </div>

              {hasSavedData && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  <AlertTriangle className="h-3 w-3" />
                  <span>This will permanently delete your saved data</span>
                </div>
              )}
              
              <Button 
                onClick={handleCompleteReset}
                variant="destructive" 
                size="sm"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Start Fresh
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