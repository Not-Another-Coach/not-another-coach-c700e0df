import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LogoSettings {
  logo_url: string | null;
  fallback_text: string;
  app_name: string;
}

export function useAppLogo() {
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    logo_url: null,
    fallback_text: 'YJ',
    app_name: 'Your Journey'
  });
  const [loading, setLoading] = useState(true);

  const fetchLogoSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'app_logo')
        .single();

      if (error) {
        console.error('Error fetching logo settings:', error);
        return;
      }

      if (data?.setting_value) {
        setLogoSettings(data.setting_value as unknown as LogoSettings);
      }
    } catch (error) {
      console.error('Error fetching logo settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLogoSettings = async (newSettings: LogoSettings): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'app_logo',
          setting_value: JSON.stringify(newSettings)
        }, {
          onConflict: 'setting_key'
        });

      if (error) {
        console.error('Error updating logo settings:', error);
        return false;
      }

      setLogoSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error updating logo settings:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchLogoSettings();

    // Listen for real-time updates
    const subscription = supabase
      .channel('app_settings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'app_settings',
        filter: 'setting_key=eq.app_logo'
      }, () => {
        fetchLogoSettings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    logoSettings,
    loading,
    updateLogoSettings,
    refetch: fetchLogoSettings
  };
}