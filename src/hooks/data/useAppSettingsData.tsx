import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
}

export const useAppSettingsData = (settingKey: string) => {
  return useQuery({
    queryKey: ['app-settings', settingKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_key', settingKey)
        .maybeSingle();

      if (error) throw error;

      return data as AppSetting | null;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
