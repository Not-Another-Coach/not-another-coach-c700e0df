import React, { useState } from 'react';
import { Calendar, Clock, Edit, X, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useDiscoveryCallBooking } from '@/hooks/useDiscoveryCallBooking';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DiscoveryCallBookingModal } from './DiscoveryCallBookingModal';

interface EditDiscoveryCallButtonProps {
  trainer: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
  };
  discoveryCall: {
    id: string;
    scheduled_for: string;
    duration_minutes: number;
    status: string;
  };
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCallUpdated?: () => void;
}

export const EditDiscoveryCallButton = ({ 
  trainer, 
  discoveryCall,
  variant = 'default',
  size = 'md',
  className = '',
  onCallUpdated
}: EditDiscoveryCallButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { getAvailableSlots, bookDiscoveryCall } = useDiscoveryCallBooking();

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const handleCancelCall = async () => {
    if (!cancellationReason.trim()) {
      toast({
        title: "Cancellation reason required",
        description: "Please provide a reason for cancelling the discovery call.",
        variant: "destructive",
      });
      return;
    }

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

      setIsModalOpen(false);
      setIsCancelling(false);
      setCancellationReason('');
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

  const handleReschedule = () => {
    setIsRescheduling(true);
  };

  const handleRescheduleComplete = async () => {
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
    
    setIsRescheduling(false);
    setIsModalOpen(false);
    onCallUpdated?.();
  };

  const resetModal = () => {
    setIsCancelling(false);
    setIsRescheduling(false);
    setCancellationReason('');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetModal();
  };

  const scheduledDate = new Date(discoveryCall.scheduled_for);

  // Show reschedule modal
  if (isRescheduling) {
    return (
      <DiscoveryCallBookingModal
        isOpen={isRescheduling}
        onClose={() => {
          setIsRescheduling(false);
          setIsModalOpen(false);
        }}
        trainer={trainer}
        onCallBooked={handleRescheduleComplete}
      />
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
        >
          <Edit className="w-4 h-4" />
          Edit/Cancel Booking
        </Button>
      </DialogTrigger>
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

          {!isCancelling && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                What would you like to do with this booking?
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  onClick={handleReschedule}
                  className="flex items-center gap-2 justify-center"
                >
                  <CalendarDays className="w-4 h-4" />
                  Reschedule to Different Time
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsCancelling(true)}
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

          {!isCancelling && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleModalClose}
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