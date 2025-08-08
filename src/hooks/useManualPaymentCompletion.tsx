import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useManualPaymentCompletion = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const completePayment = async (trainerId: string, clientId?: string) => {
    setLoading(true);
    
    try {
      // Get current user if clientId not provided
      const currentClientId = clientId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!currentClientId) {
        throw new Error('No client ID found');
      }

      // Update coach selection request status to completed
      const { error: selectionError } = await supabase
        .from('coach_selection_requests')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('client_id', currentClientId)
        .eq('trainer_id', trainerId);

      if (selectionError) {
        throw selectionError;
      }

      // Update engagement stage to active_client
      const { error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .upsert({
          client_id: currentClientId,
          trainer_id: trainerId,
          stage: 'active_client',
          became_client_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (engagementError) {
        throw engagementError;
      }

      toast({
        title: "Payment Completed!",
        description: "The client has been successfully onboarded.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error completing payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete payment",
        variant: "destructive"
      });
      return { error: error.message || "Failed to complete payment" };
    } finally {
      setLoading(false);
    }
  };

  return {
    completePayment,
    loading
  };
};