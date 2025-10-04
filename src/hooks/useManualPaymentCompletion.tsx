import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services';

export const useManualPaymentCompletion = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const completePayment = async (trainerId: string, clientId?: string) => {
    setLoading(true);
    
    try {
      // Get current user if clientId not provided
      const currentClientId = clientId || (await AuthService.getCurrentUser()).data?.id;
      
      if (!currentClientId) {
        throw new Error('No client ID found');
      }

      // Use the new atomic payment completion function with explicit null for stripe_payment_intent_id
      const { data, error } = await supabase.rpc('complete_coach_selection_payment', {
        p_client_id: currentClientId,
        p_trainer_id: trainerId,
        p_payment_method: 'manual',
        p_stripe_payment_intent_id: null
      });

      if (error) {
        throw error;
      }

      // Parse the JSON response
      const result = data as { success: boolean; error?: string; package_id?: string; payment_id?: string };

      // Check if the function returned success
      if (!result?.success) {
        throw new Error(result?.error || 'Payment completion failed');
      }

      toast({
        title: "Payment Completed!",
        description: "The client has been successfully onboarded and payment package created.",
      });

      return { 
        success: true, 
        packageId: result.package_id,
        paymentId: result.payment_id 
      };
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