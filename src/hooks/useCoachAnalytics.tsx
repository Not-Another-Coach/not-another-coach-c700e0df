import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CoachAnalytics {
  id: string;
  trainer_id: string;
  total_views: number;
  total_likes: number;
  total_saves: number;
  total_shortlists: number;
  match_tier_stats: any;
  conversion_rate: number;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

interface ClientVisibility {
  id: string;
  primary_goals?: string[];
  training_location_preference?: string;
  preferred_training_frequency?: number;
  preferred_time_slots?: string[];
  client_personality_type?: string[];
  preferred_coaching_style?: string[];
  budget_range_min?: number;
  budget_range_max?: number;
  experience_level?: string;
  // Hide identity fields until discovery call
  first_name?: never;
  last_name?: never;
  profile_photo_url?: never;
}

export function useCoachAnalytics(trainerId?: string) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<CoachAnalytics | null>(null);
  const [shortlistedClients, setShortlistedClients] = useState<ClientVisibility[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user || !trainerId) return;

    try {
      const { data, error } = await supabase
        .from('coach_analytics')
        .select('*')
        .eq('trainer_id', trainerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching coach analytics:', error);
      } else {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching coach analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user, trainerId]);

  const fetchShortlistedClients = useCallback(async () => {
    if (!user || !trainerId) return;

    try {
      // Get clients who have shortlisted this trainer from the engagement table
      const { data: engagementData, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select('client_id, created_at')
        .eq('trainer_id', trainerId)
        .eq('stage', 'shortlisted');

      if (engagementError) {
        console.error('Error fetching shortlisted clients:', engagementError);
        return;
      }

      if (!engagementData || engagementData.length === 0) {
        setShortlistedClients([]);
        return;
      }

      // Get limited client info for those who shortlisted (excluding identity info)
      const clientIds = engagementData.map(e => e.client_id);
      const { data: clientData, error: clientError } = await supabase
        .from('profiles')
        .select(`
          id,
          primary_goals,
          training_location_preference,
          preferred_training_frequency,
          preferred_time_slots,
          client_personality_type,
          preferred_coaching_style,
          budget_range_min,
          budget_range_max,
          experience_level
        `)
        .in('id', clientIds)
        .eq('user_type', 'client');

      if (clientError) {
        console.error('Error fetching client data:', clientError);
        return;
      }

      // Check for discovery calls
      const { data: discoveryCallData } = await supabase
        .from('discovery_calls')
        .select('client_id')
        .eq('trainer_id', trainerId)
        .in('client_id', clientIds);

      // Combine with discovery call info
      const enrichedClients = clientData?.map(client => {
        const hasDiscoveryCall = discoveryCallData?.some(dc => dc.client_id === client.id);
        return {
          ...client,
          discovery_call_booked: hasDiscoveryCall
        };
      }) || [];

      setShortlistedClients(enrichedClients);
    } catch (error) {
      console.error('Error fetching shortlisted clients:', error);
    }
  }, [user, trainerId]);

  useEffect(() => {
    if (user && trainerId) {
      fetchAnalytics();
      fetchShortlistedClients();
    } else {
      setAnalytics(null);
      setShortlistedClients([]);
      setLoading(false);
    }
  }, [user, trainerId, fetchAnalytics, fetchShortlistedClients]);

  const updateAnalytics = useCallback(async (updates: Partial<CoachAnalytics>) => {
    if (!user || !trainerId) return { error: 'No user or trainer ID' };

    try {
      const { data, error } = await supabase
        .from('coach_analytics')
        .upsert({
          trainer_id: trainerId,
          ...updates,
          last_activity_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating analytics:', error);
        return { error };
      }

      setAnalytics(data);
      return { data };
    } catch (error) {
      console.error('Error updating analytics:', error);
      return { error };
    }
  }, [user, trainerId]);

  const incrementView = useCallback(async () => {
    if (!analytics) return;
    
    await updateAnalytics({
      total_views: analytics.total_views + 1
    });
  }, [analytics, updateAnalytics]);

  const incrementLike = useCallback(async () => {
    if (!analytics) return;
    
    await updateAnalytics({
      total_likes: analytics.total_likes + 1
    });
  }, [analytics, updateAnalytics]);

  const incrementSave = useCallback(async () => {
    if (!analytics) return;
    
    await updateAnalytics({
      total_saves: analytics.total_saves + 1
    });
  }, [analytics, updateAnalytics]);

  const incrementShortlist = useCallback(async () => {
    if (!analytics) return;
    
    await updateAnalytics({
      total_shortlists: analytics.total_shortlists + 1
    });
  }, [analytics, updateAnalytics]);

  return {
    analytics,
    shortlistedClients,
    loading,
    incrementView,
    incrementLike,
    incrementSave,
    incrementShortlist,
    refetchAnalytics: fetchAnalytics,
    refetchShortlistedClients: fetchShortlistedClients
  };
}