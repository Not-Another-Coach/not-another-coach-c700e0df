import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useWaitlist } from '@/hooks/useWaitlist';
import { queryConfig } from '@/lib/queryConfig';

interface WeeklySchedule {
  [key: string]: {
    enabled: boolean;
    slots: Array<{
      start: string;
      end: string;
    }>;
  };
}

interface CoachAvailabilitySettings {
  id?: string;
  coach_id: string;
  availability_status: 'accepting' | 'waitlist' | 'unavailable';
  next_available_date?: string;
  allow_discovery_calls_on_waitlist: boolean;
  auto_follow_up_days: number;
  waitlist_message?: string;
  availability_schedule: WeeklySchedule;
  waitlist_exclusive_until?: string;
  waitlist_exclusive_active?: boolean;
}

const defaultSchedule: WeeklySchedule = {
  monday: { enabled: false, slots: [] },
  tuesday: { enabled: false, slots: [] },
  wednesday: { enabled: false, slots: [] },
  thursday: { enabled: false, slots: [] },
  friday: { enabled: false, slots: [] },
  saturday: { enabled: false, slots: [] },
  sunday: { enabled: false, slots: [] }
};

export function useCoachAvailability() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { waitlistEntries } = useWaitlist();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['coach-availability', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('coach_availability_settings')
        .select('*')
        .eq('coach_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Return data if exists, otherwise return default settings
      if (data) {
        return {
          ...data,
          availability_schedule: data.availability_schedule as WeeklySchedule
        };
      }
      
      // Return default settings if none exist
      return {
        coach_id: user.id,
        availability_status: 'accepting' as const,
        allow_discovery_calls_on_waitlist: true,
        auto_follow_up_days: 14,
        availability_schedule: defaultSchedule,
      };
    },
    enabled: !!user?.id,
    staleTime: queryConfig.availability.staleTime,
    gcTime: queryConfig.availability.gcTime,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<CoachAvailabilitySettings>) => {
      if (!user || !settings) throw new Error('User or settings not available');

      const updatedSettings = { ...settings, ...updates };
      
      const { data, error } = await supabase
        .from('coach_availability_settings')
        .upsert({
          coach_id: user.id,
          availability_status: updatedSettings.availability_status,
          next_available_date: updatedSettings.next_available_date || null,
          allow_discovery_calls_on_waitlist: updatedSettings.allow_discovery_calls_on_waitlist,
          auto_follow_up_days: updatedSettings.auto_follow_up_days,
          waitlist_message: updatedSettings.waitlist_message || null,
          availability_schedule: updatedSettings.availability_schedule
        }, {
          onConflict: 'coach_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-availability', user?.id] });
      toast({
        title: "Settings updated",
        description: "Your availability settings have been saved",
      });
    },
    onError: (error) => {
      console.error('Error updating coach availability settings:', error);
      toast({
        title: "Error",
        description: "Failed to update availability settings",
        variant: "destructive",
      });
    },
  });

  const getWaitlistCount = useCallback(() => {
    return waitlistEntries.filter(entry => entry.status === 'active').length;
  }, [waitlistEntries]);

  return {
    settings,
    loading: isLoading,
    saving: updateMutation.isPending,
    updateSettings: updateMutation.mutateAsync,
    refetch,
    getWaitlistCount
  };
}
