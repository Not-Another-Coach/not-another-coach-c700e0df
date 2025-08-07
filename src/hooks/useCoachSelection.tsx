import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CoachSelectionRequest {
  id: string;
  client_id: string;
  trainer_id: string;
  package_id: string;
  package_name: string;
  package_price: number;
  package_duration: string;
  status: 'pending' | 'accepted' | 'declined' | 'alternative_suggested';
  client_message?: string;
  trainer_response?: string;
  suggested_alternative_package_id?: string;
  suggested_alternative_package_name?: string;
  suggested_alternative_package_price?: number;
  created_at: string;
  updated_at: string;
  responded_at?: string;
}

export function useCoachSelection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createSelectionRequest = useCallback(async (
    trainerId: string,
    packageId: string,
    packageName: string,
    packagePrice: number,
    packageDuration: string,
    clientMessage?: string
  ) => {
    console.log('🔥 COACH SELECTION REQUEST START');
    console.log('🔥 User object:', user);
    console.log('🔥 User ID:', user?.id);
    console.log('🔥 User email:', user?.email);

    if (!user) {
      console.error('❌ No user found - not authenticated');
      toast.error('You must be logged in to select a coach');
      return { error: 'Not authenticated' };
    }

    setLoading(true);
    try {
      console.log('🚀 Creating coach selection request with params:', {
        trainerId,
        packageId,
        packageName,
        packagePrice,
        packageDuration,
        clientMessage,
        userId: user?.id
      });

      console.log('📡 Calling Supabase RPC function...');
      const { data, error } = await supabase.rpc('create_coach_selection_request', {
        p_package_duration: packageDuration,
        p_package_id: packageId,
        p_package_name: packageName,
        p_package_price: packagePrice,
        p_trainer_id: trainerId,
        p_client_message: clientMessage
      });

      console.log('📥 Raw Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase RPC error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
        toast.error(`Failed to send selection request: ${error.message}`);
        return { error };
      }

      console.log('🎉 Selection request created successfully with ID:', data);
      toast.success('Selection request sent to coach!');
      return { data, success: true };
    } catch (error: any) {
      console.error('💥 Exception caught during request:', {
        message: error?.message,
        stack: error?.stack,
        fullError: error
      });
      toast.error(`Failed to send selection request: ${error?.message || 'Unknown error'}`);
      return { error };
    } finally {
      setLoading(false);
      console.log('🔚 COACH SELECTION REQUEST END');
    }
  }, [user]);

  const getSelectionRequest = useCallback(async (trainerId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('coach_selection_requests')
        .select('*')
        .eq('client_id', user.id)
        .eq('trainer_id', trainerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching selection request:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error fetching selection request:', error);
      return { error };
    }
  }, [user]);

  const respondToRequest = useCallback(async (
    requestId: string,
    status: 'accepted' | 'declined' | 'alternative_suggested',
    trainerResponse?: string,
    alternativePackage?: {
      id: string;
      name: string;
      price: number;
    }
  ) => {
    if (!user) {
      toast.error('You must be logged in to respond');
      return { error: 'Not authenticated' };
    }

    setLoading(true);
    try {
      const updateData: any = {
        status,
        trainer_response: trainerResponse,
        responded_at: new Date().toISOString()
      };

      if (alternativePackage) {
        updateData.suggested_alternative_package_id = alternativePackage.id;
        updateData.suggested_alternative_package_name = alternativePackage.name;
        updateData.suggested_alternative_package_price = alternativePackage.price;
      }

      const { error } = await supabase
        .from('coach_selection_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Error responding to request:', error);
        toast.error('Failed to respond to request');
        return { error };
      }

      const statusMessages = {
        accepted: 'Request accepted! Client now awaiting payment.',
        declined: 'Request declined and client notified',
        alternative_suggested: 'Alternative package suggested to client'
      };

      toast.success(statusMessages[status]);
      return { success: true };
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
      return { error };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getPendingRequests = useCallback(async () => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('coach_selection_requests')
        .select(`
          *,
          client:profiles!coach_selection_requests_client_id_fkey(
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .eq('trainer_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending requests:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return { error };
    }
  }, [user]);

  return {
    loading,
    createSelectionRequest,
    getSelectionRequest,
    respondToRequest,
    getPendingRequests
  };
}