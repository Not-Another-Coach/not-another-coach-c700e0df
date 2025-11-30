import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useDiscoveryCallSettingsData } from './data/useDiscoveryCallSettingsData';

interface DiscoveryCallSettings {
  id?: string;
  trainer_id: string;
  offers_discovery_call: boolean | null;
  discovery_call_duration: number;
  availability_schedule: {
    [key: string]: {
      enabled: boolean;
      slots: Array<{
        start: string;
        end: string;
      }>;
    };
  };
  prep_notes?: string;
}

export function useDiscoveryCallSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use data hook for fetching
  const { data: rawSettings, isLoading, error } = useDiscoveryCallSettingsData();

  // Transform raw settings to match expected format
  const settings = rawSettings ? {
    ...rawSettings,
    availability_schedule: rawSettings.discovery_call_availability_schedule
  } as DiscoveryCallSettings : null;

  // Mutation for updating settings
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<DiscoveryCallSettings>) => {
      if (!user || !settings) throw new Error('No user or settings');

      const updatedSettings = { ...settings, ...updates };
      
      const { data, error } = await supabase
        .from('discovery_call_settings')
        .upsert({
          trainer_id: user.id,
          offers_discovery_call: updatedSettings.offers_discovery_call,
          discovery_call_duration: updatedSettings.discovery_call_duration,
          discovery_call_availability_schedule: updatedSettings.availability_schedule,
          prep_notes: updatedSettings.prep_notes
        }, {
          onConflict: 'trainer_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['discovery-call-settings', user?.id] });
      
      toast({
        title: "Settings updated",
        description: "Your discovery call settings have been saved",
      });
    },
    onError: (error: any) => {
      console.error('Error updating discovery call settings:', error);
      
      if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to update these settings",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update discovery call settings",
          variant: "destructive",
        });
      }
    }
  });

  // Show error toast if data fetch failed
  if (error) {
    console.error('Error fetching discovery call settings:', error);
  }

  return {
    settings,
    loading: isLoading,
    saving: updateMutation.isPending,
    updateSettings: updateMutation.mutate,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['discovery-call-settings', user?.id] })
  };
}