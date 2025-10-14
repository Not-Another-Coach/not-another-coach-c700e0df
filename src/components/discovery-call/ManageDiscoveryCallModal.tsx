import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, X, Edit, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { ClientRescheduleModal } from '../dashboard/ClientRescheduleModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ManageDiscoveryCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  discoveryCall: {
    id: string;
    scheduled_for: string;
    duration_minutes: number;
    status: string;
    booking_notes?: string | null;
    reminder_24h_sent?: string | null;
    reminder_1h_sent?: string | null;
  };
  trainer: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    profilePhotoUrl?: string;
  };
  onCallUpdated?: () => void;
  viewMode?: 'client' | 'trainer';
}

export const ManageDiscoveryCallModal = ({
  isOpen,
  onClose,
  discoveryCall,
  trainer,
  onCallUpdated,
  viewMode = 'client'
}: ManageDiscoveryCallModalProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  const handleCancelCall = async () => {
    setCancelling(true);
    try {
      const { error } = await supabase
        .from('discovery_calls')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', discoveryCall.id);

      if (error) throw error;

      // Create cancellation notifications for both trainer and client
      const formattedDate = format(scheduledDate, 'MMMM d, yyyy \'at\' h:mm a');
      
      // Get trainer and client names
      const { data: trainerProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', trainer.id)
        .maybeSingle();
      
      const { data: callData } = await supabase
        .from('discovery_calls')
        .select('client_id')
        .eq('id', discoveryCall.id)
        .single();
      
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', callData?.client_id)
        .maybeSingle();
      
      const trainerName = `${trainerProfile?.first_name || ''} ${trainerProfile?.last_name || ''}`.trim() || 'the trainer';
      const clientName = `${clientProfile?.first_name || ''} ${clientProfile?.last_name || ''}`.trim() || 'the client';
      
      // Alert for trainer
      await supabase.from('alerts').insert({
        alert_type: 'discovery_call_cancelled',
        title: 'Discovery Call Cancelled',
        content: `${viewMode === 'trainer' ? clientName : 'You'} ${viewMode === 'trainer' ? 'has' : 'have'} cancelled the discovery call scheduled for ${formattedDate}`,
        target_audience: { trainers: [trainer.id] },
        metadata: { 
          discovery_call_id: discoveryCall.id, 
          client_id: callData?.client_id, 
          trainer_id: trainer.id, 
          scheduled_for: discoveryCall.scheduled_for 
        },
        is_active: true
      });
      
      // Alert for client
      if (callData?.client_id) {
        await supabase.from('alerts').insert({
          alert_type: 'discovery_call_cancelled',
          title: 'Discovery Call Cancelled',
          content: `${viewMode === 'client' ? 'You have' : `${trainerName} has`} cancelled the discovery call scheduled for ${formattedDate}`,
          target_audience: { clients: [callData.client_id] },
          metadata: { 
            discovery_call_id: discoveryCall.id, 
            client_id: callData.client_id, 
            trainer_id: trainer.id, 
            scheduled_for: discoveryCall.scheduled_for 
          },
          is_active: true
        });
      }

      toast({
        title: "Call cancelled",
        description: "The discovery call has been cancelled successfully.",
      });

      onCallUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error cancelling call:', error);
      toast({
        title: "Cancellation failed",
        description: "Failed to cancel the discovery call. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const scheduledDate = new Date(discoveryCall.scheduled_for);
  const now = new Date();
  const isUpcoming = scheduledDate > now;
  const isWithin15Mins = scheduledDate.getTime() - now.getTime() <= 15 * 60 * 1000 && isUpcoming;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {trainer.profilePhotoUrl ? (
                  <img 
                    src={trainer.profilePhotoUrl} 
                    alt={trainer.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {trainer.firstName?.[0]}{trainer.lastName?.[0]}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {viewMode === 'trainer' ? 'Discovery Call Details' : 'Manage Discovery Call'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {viewMode === 'trainer' ? `with ${trainer.name}` : `with ${trainer.name}`}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Call Status Badge */}
            <div className="flex gap-2">
              <Badge variant={discoveryCall.status === 'scheduled' ? 'default' : 'secondary'}>
                {discoveryCall.status.charAt(0).toUpperCase() + discoveryCall.status.slice(1)}
              </Badge>
              {discoveryCall.reminder_24h_sent && (
                <Badge variant="outline" className="text-xs">
                  24h reminder sent
                </Badge>
              )}
              {discoveryCall.reminder_1h_sent && (
                <Badge variant="outline" className="text-xs">
                  1h reminder sent
                </Badge>
              )}
            </div>

            {/* Call Details Card */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{format(scheduledDate, 'EEEE, MMMM do, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{format(scheduledDate, 'HH:mm')} ({discoveryCall.duration_minutes} minutes)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>With {trainer.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Notes */}
            {discoveryCall.booking_notes && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 text-sm">
                    {viewMode === 'trainer' ? "Client's Notes" : 'Your Notes'}
                  </h4>
                  <p className="text-sm text-muted-foreground">{discoveryCall.booking_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Join Call Button (if within 15 mins) */}
            {isWithin15Mins && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-3">
                  Your call is starting soon! Join when you're ready.
                </p>
                <Button className="w-full" variant="default">
                  Join Call
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            {isUpcoming && discoveryCall.status !== 'cancelled' && (
              <div className="flex gap-2">
                {viewMode === 'client' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleModal(true)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                  className={viewMode === 'client' ? "flex-1 text-destructive hover:text-destructive" : "w-full text-destructive hover:text-destructive"}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Call
                </Button>
              </div>
            )}

            {/* Cancelled Call Message */}
            {discoveryCall.status === 'cancelled' && (
              <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This call has been cancelled
                </p>
              </div>
            )}

            {!isUpcoming && discoveryCall.status !== 'cancelled' && (
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  This discovery call has already taken place
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Cancel Discovery Call?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your discovery call scheduled for{' '}
              {format(scheduledDate, 'EEEE, MMMM do')} at {format(scheduledDate, 'HH:mm')}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Call</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelCall}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Call'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <ClientRescheduleModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          discoveryCall={discoveryCall}
          trainer={trainer}
          onCallUpdated={() => {
            setShowRescheduleModal(false);
            onCallUpdated?.();
            onClose();
          }}
        />
      )}
    </>
  );
};