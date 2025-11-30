import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useWaitlistEntriesData, WaitlistEntry } from '@/hooks/data/useWaitlistEntriesData';

export type { WaitlistStatus, WaitlistEntry } from '@/hooks/data/useWaitlistEntriesData';
export type CoachAvailabilityStatus = 'accepting' | 'waitlist' | 'unavailable';

/**
 * Logic hook for waitlist operations
 * Consumes useWaitlistEntriesData for data and adds mutations
 * Does NOT fetch availability settings (use useCoachAvailability instead)
 */
export function useWaitlist() {
  const { user } = useAuth();
  const { entries: waitlistEntries, loading, refetch } = useWaitlistEntriesData();
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: async ({ coachId, clientGoals }: { coachId: string; clientGoals?: string }) => {
      if (!user) throw new Error('No user');

      // Check if already on waitlist
      const { data: existingEntry } = await supabase
        .from('coach_waitlists')
        .select('id')
        .eq('client_id', user.id)
        .eq('coach_id', coachId)
        .maybeSingle();

      if (existingEntry) {
        throw new Error('You are already on this trainer\'s waitlist');
      }

      // Get coach's availability settings for estimated start date
      const { data: coachSettings } = await supabase
        .from('coach_availability_settings')
        .select('*')
        .eq('coach_id', coachId)
        .maybeSingle();

      const { data, error } = await supabase
        .from('coach_waitlists')
        .insert({
          client_id: user.id,
          coach_id: coachId,
          client_goals: clientGoals,
          estimated_start_date: coachSettings?.next_available_date || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist-entries', user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ entryId, updates }: { entryId: string; updates: Partial<WaitlistEntry> }) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('coach_waitlists')
        .update(updates)
        .eq('id', entryId)
        .eq('coach_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist-entries', user?.id] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (coachId: string) => {
      if (!user) throw new Error('No user');

      const { data: existingEntry, error: checkError } = await supabase
        .from('coach_waitlists')
        .select('*')
        .eq('client_id', user.id)
        .eq('coach_id', coachId)
        .maybeSingle();

      if (checkError) throw checkError;
      if (!existingEntry) throw new Error('You are not on this coach\'s waitlist');

      const { data, error } = await supabase
        .from('coach_waitlists')
        .delete()
        .eq('client_id', user.id)
        .eq('coach_id', coachId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No waitlist entry was removed');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist-entries', user?.id] });
    },
  });

  const joinWaitlist = useCallback(async (coachId: string, clientGoals?: string) => {
    try {
      const data = await joinMutation.mutateAsync({ coachId, clientGoals });
      return { success: true, data };
    } catch (error: any) {
      console.error('Error joining waitlist:', error);
      return { error: error.message || 'Failed to join waitlist' };
    }
  }, [joinMutation]);

  const updateWaitlistEntry = useCallback(async (entryId: string, updates: Partial<WaitlistEntry>) => {
    try {
      const data = await updateMutation.mutateAsync({ entryId, updates });
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating waitlist entry:', error);
      return { error: error.message || 'Failed to update waitlist entry' };
    }
  }, [updateMutation]);

  const removeFromWaitlist = useCallback(async (coachId: string) => {
    try {
      const deletedRows = await removeMutation.mutateAsync(coachId);
      return { success: true, deletedRows };
    } catch (error: any) {
      console.error('Error removing from waitlist:', error);
      return { error: error.message || 'Failed to remove from waitlist' };
    }
  }, [removeMutation]);

  const checkClientWaitlistStatus = useCallback(async (coachId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('coach_waitlists')
        .select('*')
        .eq('client_id', user.id)
        .eq('coach_id', coachId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking waitlist status:', error);
      return null;
    }
  }, [user]);

  const getCoachAvailability = useCallback(async (coachId: string) => {
    try {
      const { data, error } = await supabase
        .from('coach_availability_settings')
        .select('*')
        .eq('coach_id', coachId)
        .maybeSingle();

      if (error) throw error;
      
      // Return default if no settings exist
      if (!data) {
        return {
          coach_id: coachId,
          availability_status: 'accepting' as const,
          allow_discovery_calls_on_waitlist: true,
          auto_follow_up_days: 14,
          waitlist_message: null
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching coach availability:', error);
      return null;
    }
  }, []);

  return {
    waitlistEntries,
    loading,
    joinWaitlist,
    removeFromWaitlist,
    updateWaitlistEntry,
    checkClientWaitlistStatus,
    getCoachAvailability,
    refetch,
  };
}
