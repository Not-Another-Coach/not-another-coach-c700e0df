import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { ClientJourneyStage } from '@/hooks/useClientJourneyProgress';

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

  // Helper function to check if client has any active engagements
  const checkForActiveEngagements = async (clientId: string): Promise<boolean> => {
    try {
      // Check for active discovery calls
      const { data: discoveryCalls } = await supabase
        .from('discovery_calls')
        .select('id')
        .eq('client_id', clientId)
        .eq('status', 'scheduled')
        .limit(1);

      // Check for active engagements (beyond browsing and liked)
      const { data: engagements } = await supabase
        .from('client_trainer_engagement')
        .select('stage')
        .eq('client_id', clientId)
        .in('stage', ['shortlisted', 'discovery_call_booked', 'discovery_in_progress', 'matched', 'discovery_completed', 'active_client'])
        .limit(1);

      // Check for other pending coach selection requests
      const { data: pendingRequests } = await supabase
        .from('coach_selection_requests')
        .select('id')
        .eq('client_id', clientId)
        .eq('status', 'pending')
        .limit(1);

      return (discoveryCalls?.length || 0) > 0 || 
             (engagements?.length || 0) > 0 || 
             (pendingRequests?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking active engagements:', error);
      return true; // Assume active to be safe
    }
  };

  // Helper function to update client journey stage
  const updateClientJourneyStage = async (clientId: string, stage: ClientJourneyStage) => {
    try {
      await supabase
        .from('profiles')
        .update({ client_journey_stage: stage })
        .eq('id', clientId);
    } catch (error) {
      console.error('Error updating client journey stage:', error);
    }
  };

  const createSelectionRequest = useCallback(async (
    trainerId: string,
    packageId: string,
    packageName: string,
    packagePrice: number,
    packageDuration: string,
    clientMessage?: string
  ) => {
    if (!user) {
      toast.error('You must be logged in to select a coach');
      return { error: 'Not authenticated' };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_coach_selection_request', {
        p_trainer_id: trainerId,
        p_package_id: packageId,
        p_package_name: packageName,
        p_package_price: Number(packagePrice),
        p_package_duration: packageDuration || '',
        p_client_message: clientMessage || null
      });

      if (error) {
        toast.error(`Failed to send selection request: ${error.message}`);
        return { error };
      }

      toast.success('Selection request sent to coach!');
      return { data, success: true };
    } catch (error: any) {
      toast.error(`Failed to send selection request: ${error?.message || 'Unknown error'}`);
      return { error };
    } finally {
      setLoading(false);
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

      // First get the request to know the client_id
      const { data: requestData, error: fetchError } = await supabase
        .from('coach_selection_requests')
        .select('client_id')
        .eq('id', requestId)
        .single();

      if (fetchError) {
        console.error('Error fetching request data:', fetchError);
        toast.error('Failed to respond to request');
        return { error: fetchError };
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

      // If request is declined, update engagement status and check if client should be moved back to exploring coaches
      if (status === 'declined' && requestData?.client_id) {
        // Update the engagement status to 'declined'
        await supabase.rpc('update_engagement_stage', {
          client_uuid: requestData.client_id,
          trainer_uuid: user.id,
          new_stage: 'declined'
        });

        const hasActiveEngagements = await checkForActiveEngagements(requestData.client_id);
        
        if (!hasActiveEngagements) {
          console.log('No active engagements found, moving client back to exploring_coaches stage');
          await updateClientJourneyStage(requestData.client_id, 'exploring_coaches');
        }
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
      // First get the selection requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('coach_selection_requests')
        .select('*')
        .eq('trainer_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching selection requests:', requestsError);
        return { error: requestsError };
      }

      if (!requestsData || requestsData.length === 0) {
        return { data: [] };
      }

      // Get client IDs and fetch their profiles separately
      const clientIds = requestsData.map(req => req.client_id);
      const { data: clientProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_url')
        .in('id', clientIds);

      if (profilesError) {
        console.error('Error fetching client profiles:', profilesError);
        return { error: profilesError };
      }

      // Manually join the data
      const enrichedRequests = requestsData.map(request => ({
        ...request,
        client: clientProfiles?.find(profile => profile.id === request.client_id) || null
      }));

      return { data: enrichedRequests };
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