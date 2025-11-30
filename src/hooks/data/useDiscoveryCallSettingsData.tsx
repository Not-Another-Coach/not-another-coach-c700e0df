import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryConfig } from '@/lib/queryConfig';

interface DiscoveryCallSettings {
  id?: string;
  trainer_id: string;
  offers_discovery_call: boolean | null;
  discovery_call_duration: number;
  discovery_call_availability_schedule: any;
  prep_notes?: string;
}

export const useDiscoveryCallSettingsData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['discovery-call-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('discovery_call_settings')
        .select('*')
        .eq('trainer_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        return data as DiscoveryCallSettings;
      }

      // Return default settings if none exist
      return {
        trainer_id: user.id,
        offers_discovery_call: null,
        discovery_call_duration: 15,
        discovery_call_availability_schedule: {
          monday: { enabled: false, slots: [] },
          tuesday: { enabled: false, slots: [] },
          wednesday: { enabled: false, slots: [] },
          thursday: { enabled: false, slots: [] },
          friday: { enabled: false, slots: [] },
          saturday: { enabled: false, slots: [] },
          sunday: { enabled: false, slots: [] }
        },
        prep_notes: ''
      } as DiscoveryCallSettings;
    },
    enabled: !!user?.id,
    staleTime: queryConfig.availability.staleTime,
    gcTime: queryConfig.availability.gcTime,
    refetchOnMount: queryConfig.availability.refetchOnMount,
    refetchOnWindowFocus: queryConfig.availability.refetchOnWindowFocus,
    refetchOnReconnect: queryConfig.availability.refetchOnReconnect,
  });
};
