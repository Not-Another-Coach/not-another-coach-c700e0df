import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type WaitlistStatus = 'active' | 'contacted' | 'converted' | 'archived';
export type CoachAvailabilityStatus = 'accepting' | 'waitlist' | 'unavailable';

interface WaitlistEntry {
  id: string;
  client_id: string;
  coach_id: string;
  status: WaitlistStatus;
  joined_at: string;
  estimated_start_date?: string;
  follow_up_scheduled_date?: string;
  last_contacted_at?: string;
  coach_notes?: string;
  client_goals?: string;
  created_at: string;
  updated_at: string;
}

interface CoachAvailabilitySettings {
  id: string;
  coach_id: string;
  availability_status: CoachAvailabilityStatus;
  next_available_date?: string;
  allow_discovery_calls_on_waitlist: boolean;
  auto_follow_up_days: number;
  waitlist_message?: string;
  created_at: string;
  updated_at: string;
}

export function useWaitlist() {
  const { user } = useAuth();
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [availabilitySettings, setAvailabilitySettings] = useState<CoachAvailabilitySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWaitlistEntries = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coach_waitlists')
        .select('*')
        .eq('coach_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setWaitlistEntries(data || []);
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
    }
  }, [user]);

  const fetchAvailabilitySettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coach_availability_settings')
        .select('*')
        .eq('coach_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAvailabilitySettings(data);
    } catch (error) {
      console.error('Error fetching availability settings:', error);
    }
  }, [user]);

  const updateAvailabilitySettings = useCallback(async (settings: Partial<CoachAvailabilitySettings>) => {
    if (!user) return { error: 'No user' };

    try {
      const { data, error } = await supabase
        .from('coach_availability_settings')
        .upsert({
          coach_id: user.id,
          ...settings
        })
        .select()
        .single();

      if (error) throw error;
      setAvailabilitySettings(data);
      return { success: true };
    } catch (error) {
      console.error('Error updating availability settings:', error);
      return { error };
    }
  }, [user]);

  const joinWaitlist = useCallback(async (coachId: string, clientGoals?: string) => {
    if (!user) return { error: 'No user' };

    try {
      // Get coach's availability settings to determine estimated start date
      const { data: coachSettings } = await supabase
        .from('coach_availability_settings')
        .select('next_available_date')
        .eq('coach_id', coachId)
        .maybeSingle();

      const { data, error } = await supabase
        .from('coach_waitlists')
        .insert({
          client_id: user.id,
          coach_id: coachId,
          client_goals: clientGoals,
          estimated_start_date: coachSettings?.next_available_date
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error joining waitlist:', error);
      return { error };
    }
  }, [user]);

  const updateWaitlistEntry = useCallback(async (entryId: string, updates: Partial<WaitlistEntry>) => {
    if (!user) return { error: 'No user' };

    try {
      const { data, error } = await supabase
        .from('coach_waitlists')
        .update(updates)
        .eq('id', entryId)
        .eq('coach_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh waitlist entries
      await fetchWaitlistEntries();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating waitlist entry:', error);
      return { error };
    }
  }, [user, fetchWaitlistEntries]);

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
      return data;
    } catch (error) {
      console.error('Error fetching coach availability:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchWaitlistEntries(),
        fetchAvailabilitySettings()
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchWaitlistEntries, fetchAvailabilitySettings]);

  return {
    waitlistEntries,
    availabilitySettings,
    loading,
    updateAvailabilitySettings,
    joinWaitlist,
    updateWaitlistEntry,
    checkClientWaitlistStatus,
    getCoachAvailability,
    refetch: () => Promise.all([fetchWaitlistEntries(), fetchAvailabilitySettings()])
  };
}