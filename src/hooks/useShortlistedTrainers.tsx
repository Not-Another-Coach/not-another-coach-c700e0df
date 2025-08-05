import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShortlistedTrainer {
  id: string;
  user_id: string;
  trainer_id: string;
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
  const [shortlistedTrainers, setShortlistedTrainers] = useState<ShortlistedTrainer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShortlistedTrainers = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shortlisted_trainers')
        .select(`
          *
        `)
        .eq('user_id', user.id)
        .order('shortlisted_at', { ascending: false });

      // Also fetch discovery calls for these trainers
      let discoveryCallsData = [];
      if (data && data.length > 0) {
        const trainerIds = data.map(item => item.trainer_id);
        console.log('Fetching discovery calls for trainers:', trainerIds);
        const { data: callsData, error: callsError } = await supabase
          .from('discovery_calls')
          .select('*')
          .eq('client_id', user.id)
          .in('trainer_id', trainerIds)
          .in('status', ['scheduled', 'rescheduled']);
        
        console.log('Discovery calls query result:', { callsData, callsError });
        discoveryCallsData = callsData || [];
      }

      if (error) {
        console.error('Error fetching shortlisted trainers:', error);
        toast.error('Failed to load shortlisted trainers');
      } else {
        // Filter out any shortlisted trainers with invalid trainer IDs (non-UUIDs)
        const validShortlisted = (data || []).filter(item => {
          // Check if trainer_id is a valid UUID (has proper format)
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.trainer_id);
          if (!isValidUUID) {
            console.warn('Removing invalid trainer ID from shortlist:', item.trainer_id);
            // Remove the invalid entry from the database
            supabase
              .from('shortlisted_trainers')
              .delete()
              .eq('id', item.id)
              .then(() => console.log('Removed invalid shortlist entry:', item.id));
          }
          return isValidUUID;
        });
        
        // Merge discovery call data with shortlisted trainers
        const mergedData = validShortlisted.map(shortlisted => {
          console.log('MERGE DEBUG - Looking for discovery call for trainer:', shortlisted.trainer_id, typeof shortlisted.trainer_id);
          console.log('MERGE DEBUG - Available discovery calls:', discoveryCallsData.map(call => ({ id: call.trainer_id, type: typeof call.trainer_id })));
          const discoveryCall = discoveryCallsData.find(call => {
            console.log('MERGE DEBUG - Comparing:', call.trainer_id, 'vs', shortlisted.trainer_id, 'equal?', call.trainer_id === shortlisted.trainer_id);
            return call.trainer_id === shortlisted.trainer_id;
          }) || null;
          console.log(`Trainer ${shortlisted.trainer_id} discovery call:`, discoveryCall);
          return {
            ...shortlisted,
            discovery_call: discoveryCall
          };
        });
        
        console.log('Final merged shortlisted data:', mergedData);
        setShortlistedTrainers(mergedData);
      }
    } catch (error) {
      console.error('Error fetching shortlisted trainers:', error);
      toast.error('Failed to load shortlisted trainers');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchShortlistedTrainers();
    } else {
      setShortlistedTrainers([]);
      setLoading(false);
    }
  }, [user, fetchShortlistedTrainers]);

  
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
      const { data, error } = await supabase
        .from('shortlisted_trainers')
        .insert({
          user_id: user.id,
          trainer_id: trainerId,
          notes,
          chat_enabled: true,
          discovery_call_enabled: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error shortlisting trainer:', error);
        toast.error('Failed to shortlist trainer');
        return { error };
      }

      setShortlistedTrainers(prev => [data, ...prev]);
      
      // Update client journey progress
      await updateClientJourney();
      
      toast.success('Trainer shortlisted! Chat and discovery call options are now available.');
      return { data };
    } catch (error) {
      console.error('Error shortlisting trainer:', error);
      toast.error('Failed to shortlist trainer');
      return { error };
    }
  }, [user, shortlistedTrainers, updateClientJourney]);

  const removeFromShortlist = useCallback(async (trainerId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('shortlisted_trainers')
        .delete()
        .eq('user_id', user.id)
        .eq('trainer_id', trainerId);

      if (error) {
        console.error('Error removing from shortlist:', error);
        toast.error('Failed to remove from shortlist');
        return { error };
      }

      setShortlistedTrainers(prev => prev.filter(st => st.trainer_id !== trainerId));
      toast.success('Trainer removed from shortlist');
      return { success: true };
    } catch (error) {
      console.error('Error removing from shortlist:', error);
      toast.error('Failed to remove from shortlist');
      return { error };
    }
  }, [user]);

  const isShortlisted = useCallback((trainerId: string) => {
    return shortlistedTrainers.some(st => st.trainer_id === trainerId);
  }, [shortlistedTrainers]);

  const updateShortlistNotes = useCallback(async (trainerId: string, notes: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('shortlisted_trainers')
        .update({ notes })
        .eq('user_id', user.id)
        .eq('trainer_id', trainerId)
        .select()
        .single();

      if (error) {
        console.error('Error updating notes:', error);
        return { error };
      }

      setShortlistedTrainers(prev => 
        prev.map(st => st.trainer_id === trainerId ? data : st)
      );
      return { data };
    } catch (error) {
      console.error('Error updating notes:', error);
      return { error };
    }
  }, [user]);

  const bookDiscoveryCall = useCallback(async (trainerId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('shortlisted_trainers')
        .update({ discovery_call_booked_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('trainer_id', trainerId)
        .select()
        .single();

      if (error) {
        console.error('Error booking discovery call:', error);
        toast.error('Failed to book discovery call');
        return { error };
      }

      setShortlistedTrainers(prev => 
        prev.map(st => st.trainer_id === trainerId ? data : st)
      );

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

      toast.success('Discovery call booking confirmed!');
      return { data };
    } catch (error) {
      console.error('Error booking discovery call:', error);
      toast.error('Failed to book discovery call');
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
    refetchShortlisted: fetchShortlistedTrainers,
    shortlistCount: shortlistedTrainers.length,
    shortlistLimit: 4,
    canShortlistMore: shortlistedTrainers.length < 4
  };
}