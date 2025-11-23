import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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
      // Add timeout to prevent hanging
      const fetchPromise = supabase
        .from('discovery_call_settings')
        .select('*')
        .eq('trainer_id', user.id)
        .maybeSingle();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        // Handle permission errors gracefully
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('Insufficient permissions to access discovery call settings');
          toast({
            title: "Access Denied",
            description: "You don't have permission to view these settings",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (error.code !== 'PGRST116') {
          console.error('Error fetching discovery call settings:', error);
          return;
        }
      }

      if (data) {
        setSettings({
          ...data,
          availability_schedule: data.discovery_call_availability_schedule as DiscoveryCallSettings['availability_schedule']
        });
      } else {
        // Create default settings if none exist - use null for "not configured"
        const defaultSettings: DiscoveryCallSettings = {
          trainer_id: user.id,
          offers_discovery_call: null,
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
    } catch (error: any) {
      console.error('Error fetching discovery call settings:', error);
      const isTimeout = error?.message === 'Request timeout';
      toast({
        title: isTimeout ? "Request Timeout" : "Error",
        description: isTimeout 
          ? "Discovery call settings are taking too long to load. Please try again."
          : "Failed to load discovery call settings",
        variant: "destructive",
      });
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

      if (error) {
        // Handle permission errors gracefully
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to update these settings",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
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