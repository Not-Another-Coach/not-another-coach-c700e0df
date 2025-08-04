import React, { useState } from 'react';
import { Calendar, Clock, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useDiscoveryCallBooking } from '@/hooks/useDiscoveryCallBooking';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [loading, setLoading] = useState(false);
  const { getAvailableSlots, bookDiscoveryCall } = useDiscoveryCallBooking();

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const handleCancelCall = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('discovery_calls')
        .update({ 
          status: 'cancelled',
          cancellation_reason: 'Cancelled by client'
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
        description: "The trainer has been notified of the cancellation.",
      });

      setIsModalOpen(false);
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

  const scheduledDate = new Date(discoveryCall.scheduled_for);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
          <DialogTitle>Discovery Call Details</DialogTitle>
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

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Need to make changes? You can cancel this booking and reschedule a new one.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelCall}
              disabled={loading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-1" />
              {loading ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};