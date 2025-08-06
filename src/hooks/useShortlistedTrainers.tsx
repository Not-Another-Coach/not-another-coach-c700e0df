import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTrainerEngagement } from '@/hooks/useTrainerEngagement';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShortlistedTrainer {
  id: string;
  user_id: string;
  trainer_id: string;
  stage: string;
  shortlisted_at: string;
  notes?: string;
  chat_enabled: boolean;
  discovery_call_enabled: boolean;
  discovery_call_booked_at?: string;
  created_at: string;
  updated_at: string;
  discovery_call?: {
    id: string;
    scheduled_for: string;
    status: string;
    duration_minutes: number;
  };
}

export function useShortlistedTrainers() {
  const { user } = useAuth();
  const { 
    getShortlistedTrainers: getEngagementShortlisted, 
    shortlistTrainer: engagementShortlistTrainer,
    updateEngagementStage,
    loading: engagementLoading 
  } = useTrainerEngagement();
  
  const [discoveryCallsData, setDiscoveryCallsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert engagement data to shortlisted trainers format
  const engagementShortlisted = getEngagementShortlisted();
  const shortlistedTrainers: ShortlistedTrainer[] = useMemo(() => 
    engagementShortlisted.map(engagement => {
      const discoveryCall = discoveryCallsData.find(call => call.trainer_id === engagement.trainerId);
      
      return {
        id: `shortlist-${engagement.trainerId}`,
        user_id: user?.id || '',
        trainer_id: engagement.trainerId,
        stage: engagement.stage,
        shortlisted_at: engagement.createdAt,
        notes: engagement.notes,
        chat_enabled: true,
        discovery_call_enabled: true,
        discovery_call_booked_at: discoveryCall?.created_at,
        created_at: engagement.createdAt,
        updated_at: engagement.updatedAt,
        discovery_call: discoveryCall
      };
    }), [engagementShortlisted, discoveryCallsData, user?.id]);

  const fetchDiscoveryCalls = useCallback(async () => {
    if (!user) {
      setDiscoveryCallsData([]);
      return;
    }

    try {
      const { data: callsData, error: callsError } = await supabase
        .from('discovery_calls')
        .select('*')
        .eq('client_id', user.id)
        .in('status', ['scheduled', 'rescheduled']);
      
      if (callsError) {
        console.error('Error fetching discovery calls:', callsError);
      } else {
        setDiscoveryCallsData(callsData || []);
      }
    } catch (error) {
      console.error('Error fetching discovery calls:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDiscoveryCalls();
    setLoading(engagementLoading);
  }, [fetchDiscoveryCalls, engagementLoading]);

  // Helper function to update client journey when shortlisting
  const updateClientJourney = useCallback(async () => {
    if (!user) return;

    try {
      // Check current journey stage
      const { data: profile } = await supabase
        .from('profiles')
        .select('client_journey_stage')
        .eq('id', user.id)
        .single();

      // Only update if currently in early stages
      if (!profile?.client_journey_stage || profile.client_journey_stage === 'preferences_identified') {
        await supabase
          .from('profiles')
          .update({ client_journey_stage: 'exploring_coaches' })
          .eq('id', user.id);

        // Track the journey step
        await supabase
          .from('user_journey_tracking')
          .upsert({
            user_id: user.id,
            stage: 'exploring_coaches',
            step_name: 'trainer_shortlisted',
            metadata: { action: 'shortlisted_trainer' }
          });
      }
    } catch (error) {
      console.error('Error updating client journey:', error);
    }
  }, [user]);

  const shortlistTrainer = useCallback(async (trainerId: string, notes?: string) => {
    if (!user) {
      toast.error('Please log in to shortlist trainers');
      return { error: 'No user logged in' };
    }

    // Check if already shortlisted
    const isAlreadyShortlisted = shortlistedTrainers.some(st => st.trainer_id === trainerId);
    if (isAlreadyShortlisted) {
      toast.error('Trainer is already shortlisted');
      return { error: 'Already shortlisted' };
    }

    // Check shortlist limit (4 trainers max)
    if (shortlistedTrainers.length >= 4) {
      toast.error('You can only shortlist up to 4 trainers');
      return { error: 'Shortlist limit reached' };
    }

    try {
      await engagementShortlistTrainer(trainerId);
      
      // Update client journey progress
      await updateClientJourney();
      
      toast.success('Trainer shortlisted! Chat and discovery call options are now available.');
      return { data: { trainer_id: trainerId } };
    } catch (error) {
      console.error('Error shortlisting trainer:', error);
      toast.error('Failed to shortlist trainer');
      return { error };
    }
  }, [user, shortlistedTrainers, engagementShortlistTrainer, updateClientJourney]);

  const removeFromShortlist = useCallback(async (trainerId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Move back to liked stage when removing from shortlist
      await updateEngagementStage(trainerId, 'liked');
      toast.success('Trainer removed from shortlist');
      return { success: true };
    } catch (error) {
      console.error('Error removing from shortlist:', error);
      toast.error('Failed to remove from shortlist');
      return { error };
    }
  }, [user, updateEngagementStage]);

  const isShortlisted = useCallback((trainerId: string) => {
    return shortlistedTrainers.some(st => st.trainer_id === trainerId);
  }, [shortlistedTrainers]);

  const updateShortlistNotes = useCallback(async (trainerId: string, notes: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Update engagement notes
      await updateEngagementStage(trainerId, 'shortlisted');
      return { data: { trainer_id: trainerId, notes } };
    } catch (error) {
      console.error('Error updating notes:', error);
      return { error };
    }
  }, [user, updateEngagementStage]);

  const bookDiscoveryCall = useCallback(async (trainerId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // The engagement stage will be updated by the trigger when discovery call is actually booked
      // in the DiscoveryCallBookingModal component
      
      // Update client journey to discovery call booked stage
      try {
        await supabase
          .from('profiles')
          .update({ client_journey_stage: 'discovery_call_booked' })
          .eq('id', user.id);

        // Track the journey step
        await supabase
          .from('user_journey_tracking')
          .upsert({
            user_id: user.id,
            stage: 'discovery_call_booked',
            step_name: 'discovery_call_booked',
            metadata: { trainer_id: trainerId, action: 'booked_discovery_call' }
          });
      } catch (journeyError) {
        console.error('Error updating journey for discovery call:', journeyError);
      }

      // Just trigger the modal - actual booking happens in the modal
      return { data: { trainer_id: trainerId } };
    } catch (error) {
      console.error('Error preparing discovery call booking:', error);
      toast.error('Failed to prepare discovery call booking');
      return { error };
    }
  }, [user]);

  return {
    shortlistedTrainers,
    loading,
    shortlistTrainer,
    removeFromShortlist,
    isShortlisted,
    updateShortlistNotes,
    bookDiscoveryCall,
    refetchShortlisted: fetchDiscoveryCalls,
    shortlistCount: shortlistedTrainers.length,
    shortlistLimit: 4,
    canShortlistMore: shortlistedTrainers.length < 4
  };
}