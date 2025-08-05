import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DynamicDiscoveryCallFeedbackForm } from '@/components/discovery-call/DynamicDiscoveryCallFeedbackForm';
import { useDiscoveryCallFeedback } from '@/hooks/useDiscoveryCallFeedback';
import { format } from 'date-fns';

interface CompletedDiscoveryCall {
  id: string;
  trainer_id: string;
  scheduled_for: string;
  status: string;
  trainer_profile: {
    first_name: string;
    last_name: string;
  };
}

interface DiscoveryCallFeedbackPromptProps {
  completedCalls: CompletedDiscoveryCall[];
  onDismiss: (callId: string) => void;
}

export function DiscoveryCallFeedbackPrompt({ 
  completedCalls, 
  onDismiss 
}: DiscoveryCallFeedbackPromptProps) {
  const [selectedCall, setSelectedCall] = useState<CompletedDiscoveryCall | null>(null);
  const [callsWithoutFeedback, setCallsWithoutFeedback] = useState<CompletedDiscoveryCall[]>([]);
  const { getFeedback } = useDiscoveryCallFeedback();

  useEffect(() => {
    const checkFeedbackStatus = async () => {
      const callsNeedingFeedback: CompletedDiscoveryCall[] = [];
      
      for (const call of completedCalls) {
        const { data: feedback } = await getFeedback(call.id);
        if (!feedback) {
          callsNeedingFeedback.push(call);
        }
      }
      
      setCallsWithoutFeedback(callsNeedingFeedback);
    };

    if (completedCalls.length > 0) {
      checkFeedbackStatus();
    }
  }, [completedCalls, getFeedback]);

  const handleFeedbackSubmitted = () => {
    if (selectedCall) {
      setCallsWithoutFeedback(prev => 
        prev.filter(call => call.id !== selectedCall.id)
      );
      setSelectedCall(null);
    }
  };

  if (callsWithoutFeedback.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        {callsWithoutFeedback.map((call) => (
          <Card key={call.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium">
                      How was your call with Coach {call.trainer_profile.first_name} {call.trainer_profile.last_name}?
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(new Date(call.scheduled_for), 'MMM d, yyyy \'at\' h:mm a')}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share your experience to help make better decisions and help coaches improve.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedCall(call)}
                  >
                    Give Feedback
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDismiss(call.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog 
        open={!!selectedCall} 
        onOpenChange={(open) => !open && setSelectedCall(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Discovery Call Feedback</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <DynamicDiscoveryCallFeedbackForm
              discoveryCallId={selectedCall.id}
              trainerId={selectedCall.trainer_id}
              trainerName={`${selectedCall.trainer_profile.first_name} ${selectedCall.trainer_profile.last_name}`}
              onSubmitted={handleFeedbackSubmitted}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}