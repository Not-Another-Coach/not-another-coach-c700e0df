import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LogoSettings {
  logo_url: string | null;
  fallback_text: string;
  app_name: string;
}

const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  logo_url: null,
  fallback_text: 'YJ',
  app_name: 'Your Journey'
};

export function useAppLogo() {
  const queryClient = useQueryClient();

  const { data: logoSettings = DEFAULT_LOGO_SETTINGS, isLoading: loading } = useQuery({
    queryKey: ['app-settings', 'app_logo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'app_logo')
        .maybeSingle();

      if (error) {
        console.error('Error fetching logo settings:', error);
        return DEFAULT_LOGO_SETTINGS;
      }

      if (data?.setting_value) {
        const parsedSettings = typeof data.setting_value === 'string' 
          ? JSON.parse(data.setting_value) 
          : data.setting_value;
        return parsedSettings as LogoSettings;
      }

      return DEFAULT_LOGO_SETTINGS;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - logo rarely changes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: LogoSettings) => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'app_logo',
          setting_value: JSON.stringify(newSettings)
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      return newSettings;
    },
    onMutate: async (newSettings) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['app-settings', 'app_logo'] });
      const previousSettings = queryClient.getQueryData(['app-settings', 'app_logo']);
      queryClient.setQueryData(['app-settings', 'app_logo'], newSettings);
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      // Revert on error
      if (context?.previousSettings) {
        queryClient.setQueryData(['app-settings', 'app_logo'], context.previousSettings);
      }
      console.error('Error updating logo settings:', err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings', 'app_logo'] });
    }
  });

  const updateLogoSettings = async (newSettings: LogoSettings): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync(newSettings);
      return true;
    } catch (error) {
      console.error('Error updating logo settings:', error);
      return false;
    }
  };

  // Real-time subscription for admin updates
  useEffect(() => {
    const subscription = supabase
      .channel('app_settings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'app_settings',
        filter: 'setting_key=eq.app_logo'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['app-settings', 'app_logo'] });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    logoSettings,
    loading,
    updateLogoSettings,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['app-settings', 'app_logo'] })
  };
}