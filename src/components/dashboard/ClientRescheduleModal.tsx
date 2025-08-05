import React, { useState } from 'react';
import { Calendar, Clock, Edit, X, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useDiscoveryCallBooking } from '@/hooks/useDiscoveryCallBooking';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DiscoveryCallBookingModal } from '../discovery-call/DiscoveryCallBookingModal';
import { useAuth } from '@/hooks/useAuth';

interface ClientRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  discoveryCall: {
    id: string;
    scheduled_for: string;
    duration_minutes: number;
    status: string;
    trainer?: {
      first_name?: string;
      last_name?: string;
    };
  };
  trainer: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
  };
  onCallUpdated?: () => void;
}

export const ClientRescheduleModal = ({ 
  isOpen,
  onClose,
  discoveryCall,
  trainer,
  onCallUpdated
}: ClientRescheduleModalProps) => {
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancelCall = async () => {
    if (!cancellationReason.trim()) {
      toast({
        title: "Cancellation reason required",
        description: "Please provide a reason for cancelling the discovery call.",
        variant: "destructive",
      });
      return;
    }

    const scheduledDate = new Date(discoveryCall.scheduled_for);
    setLoading(true);
    try {
      const { error } = await supabase
        .from('discovery_calls')
        .update({ 
          status: 'cancelled',
          cancellation_reason: cancellationReason.trim()
        })
        .eq('id', discoveryCall.id);

      if (error) {
        console.error('Error cancelling discovery call:', error);
        toast({
          title: "Failed to cancel call",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
        return;
      }

      // Create activity alert for trainer about cancellation
      console.log('Creating cancellation alert for trainer:', trainer.id);
      try {
        const alertResult = await supabase
          .from('alerts')
          .insert({
            alert_type: 'discovery_call_cancelled',
            title: 'Discovery Call Cancelled',
            content: `A client has cancelled their discovery call scheduled for ${format(scheduledDate, 'MMM d, yyyy \'at\' h:mm a')}. Reason: ${cancellationReason.trim()}`,
            created_by: trainer.id,
            target_audience: ["trainers"],
            metadata: {
              discovery_call_id: discoveryCall.id,
              cancellation_reason: cancellationReason.trim(),
              trainer_id: trainer.id
            },
            is_active: true,
            priority: 1
          });
        
        console.log('Cancellation alert creation result:', alertResult);
        if (alertResult.error) {
          console.error('Error creating cancellation alert:', alertResult.error);
        }
      } catch (alertError) {
        console.error('Error creating cancellation alert:', alertError);
      }

      // Send cancellation email to trainer
      try {
        await supabase.functions.invoke('send-discovery-call-email', {
          body: {
            type: 'trainer_notification',
            discoveryCallId: discoveryCall.id,
            notificationType: 'cancellation'
          }
        });
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
      }

      toast({
        title: "Discovery call cancelled",
        description: "The trainer has been notified and the slot is now available for others to book.",
      });

      handleClose();
      onCallUpdated?.();
    } catch (error) {
      console.error('Error cancelling call:', error);
      toast({
        title: "Failed to cancel call",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleComplete = async () => {
    // Create activity alert for trainer about rescheduling
    console.log('Creating reschedule alert for trainer:', trainer.id);
    console.log('Current user:', user);
    try {
      const alertResult = await supabase
        .from('alerts')
        .insert({
          alert_type: 'discovery_call_rescheduled',
          title: 'Discovery Call Rescheduled',
          content: `A client has rescheduled their discovery call. The previous booking has been cancelled and a new one has been made.`,
          created_by: user?.id, // Current user (client) who is rescheduling
          target_audience: ["trainers"],
          metadata: {
            old_discovery_call_id: discoveryCall.id,
            trainer_id: trainer.id,
            client_id: user?.id
          },
          is_active: true,
          priority: 1
        });
      
      console.log('Reschedule alert creation result:', alertResult);
      if (alertResult.error) {
        console.error('Error creating reschedule alert:', alertResult.error);
      } else {
        console.log('✅ Reschedule alert created successfully:', alertResult.data);
      }
    } catch (alertError) {
      console.error('Error creating reschedule alert:', alertError);
    }

    // Cancel the old booking
    try {
      await supabase
        .from('discovery_calls')
        .update({ 
          status: 'cancelled',
          cancellation_reason: 'Rescheduled to new time'
        })
        .eq('id', discoveryCall.id);
    } catch (error) {
      console.error('Error cancelling old booking:', error);
    }
    
    handleClose();
    onCallUpdated?.();
  };

  const handleClose = () => {
    setShowOptions(true);
    setIsRescheduling(false);
    setIsCancelling(false);
    setCancellationReason('');
    onClose();
  };

  const scheduledDate = new Date(discoveryCall.scheduled_for);

  // Show reschedule modal
  if (isRescheduling) {
    return (
      <DiscoveryCallBookingModal
        isOpen={isRescheduling}
        onClose={handleClose}
        trainer={trainer}
        onCallBooked={handleRescheduleComplete}
        isReschedule={true}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Discovery Call</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {format(scheduledDate, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {format(scheduledDate, 'h:mm a')} ({discoveryCall.duration_minutes} minutes)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-600">
                  Trainer: {trainer.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {discoveryCall.status === 'scheduled' ? 'Confirmed' : discoveryCall.status}
            </Badge>
          </div>

          {showOptions && !isCancelling && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                What would you like to do with this booking?
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="default"
                  onClick={() => setIsRescheduling(true)}
                  className="flex items-center gap-2 justify-center"
                >
                  <CalendarDays className="w-4 h-4" />
                  Reschedule to Different Time
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOptions(false);
                    setIsCancelling(true);
                  }}
                  className="flex items-center gap-2 justify-center text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <X className="w-4 h-4" />
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}

          {isCancelling && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancellation-reason">Reason for cancellation *</Label>
                <Textarea
                  id="cancellation-reason"
                  placeholder="Please let us know why you're cancelling this discovery call..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  This information helps us improve our service and will be shared with the trainer.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCancelling(false);
                    setShowOptions(true);
                    setCancellationReason('');
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelCall}
                  disabled={loading || !cancellationReason.trim()}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-1" />
                  {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </div>
          )}

          {showOptions && !isCancelling && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};