import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface DiscoveryCallSettings {
  id?: string;
  trainer_id: string;
  offers_discovery_call: boolean;
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
  const [settings, setSettings] = useState<DiscoveryCallSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('trainer_availability_settings')
        .select('*')
        .eq('trainer_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching discovery call settings:', error);
        return;
      }

      if (data) {
        setSettings({
          ...data,
          availability_schedule: data.discovery_call_availability_schedule as DiscoveryCallSettings['availability_schedule']
        });
      } else {
        // Create default settings if none exist
        const defaultSettings: DiscoveryCallSettings = {
          trainer_id: user.id,
          offers_discovery_call: false,
          discovery_call_duration: 15,
          availability_schedule: {
            monday: { enabled: false, slots: [] },
            tuesday: { enabled: false, slots: [] },
            wednesday: { enabled: false, slots: [] },
            thursday: { enabled: false, slots: [] },
            friday: { enabled: false, slots: [] },
            saturday: { enabled: false, slots: [] },
            sunday: { enabled: false, slots: [] }
          },
          prep_notes: ''
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching discovery call settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<DiscoveryCallSettings>) => {
    if (!user || !settings) return;

    setSaving(true);
    try {
      const updatedSettings = { ...settings, ...updates };
      
      const { data, error } = await supabase
        .from('trainer_availability_settings')
        .upsert({
          trainer_id: user.id,
          offers_discovery_call: updatedSettings.offers_discovery_call,
          discovery_call_duration: updatedSettings.discovery_call_duration,
          discovery_call_availability_schedule: updatedSettings.availability_schedule,
          prep_notes: updatedSettings.prep_notes
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating discovery call settings:', error);
        toast({
          title: "Error",
          description: "Failed to update discovery call settings",
          variant: "destructive",
        });
        return;
      }

      setSettings({
        ...data,
        availability_schedule: data.discovery_call_availability_schedule as DiscoveryCallSettings['availability_schedule']
      });
      toast({
        title: "Settings updated",
        description: "Your discovery call settings have been saved",
      });
    } catch (error) {
      console.error('Error updating discovery call settings:', error);
      toast({
        title: "Error",
        description: "Failed to update discovery call settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refetch: fetchSettings
  };
}