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
  total_shortlists_last_7_days?: number;
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
  const [shortlistedStats, setShortlistedStats] = useState({ total: 0, last7Days: 0 });
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
      // Get clients who have shortlisted this trainer or are in discovery states
      // Include: shortlisted, discovery_in_progress, discovery_call_booked, discovery_completed
      // Exclude: matched, active_client, unmatched, declined
      const { data: engagementData, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select('client_id, created_at, stage')
        .eq('trainer_id', trainerId)
        .in('stage', ['shortlisted', 'discovery_in_progress', 'discovery_call_booked', 'discovery_completed']);

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

      // Combine with discovery call info and stage
      const enrichedClients = clientData?.map(client => {
        const engagement = engagementData.find(e => e.client_id === client.id);
        const hasDiscoveryCall = discoveryCallData?.some(dc => dc.client_id === client.id);
        return {
          ...client,
          discovery_call_booked: hasDiscoveryCall,
          engagement_stage: engagement?.stage
        };
      }) || [];

      setShortlistedClients(enrichedClients);
    } catch (error) {
      console.error('Error fetching shortlisted clients:', error);
    }
  }, [user, trainerId]);

  const fetchShortlistedStats = useCallback(async () => {
    if (!user || !trainerId) return { total: 0, last7Days: 0 };

    try {
      // Get total count of shortlisted/discovery state clients
      const { data: totalData, error: totalError } = await supabase
        .from('client_trainer_engagement')
        .select('id', { count: 'exact' })
        .eq('trainer_id', trainerId)
        .in('stage', ['shortlisted', 'discovery_in_progress', 'discovery_call_booked', 'discovery_completed']);

      if (totalError) {
        console.error('Error fetching total shortlisted count:', totalError);
        return { total: 0, last7Days: 0 };
      }

      // Get count from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentData, error: recentError } = await supabase
        .from('client_trainer_engagement')
        .select('id', { count: 'exact' })
        .eq('trainer_id', trainerId)
        .in('stage', ['shortlisted', 'discovery_in_progress', 'discovery_call_booked', 'discovery_completed'])
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) {
        console.error('Error fetching recent shortlisted count:', recentError);
        return { total: totalData?.length || 0, last7Days: 0 };
      }

      return { 
        total: totalData?.length || 0, 
        last7Days: recentData?.length || 0 
      };
    } catch (error) {
      console.error('Error fetching shortlisted stats:', error);
      return { total: 0, last7Days: 0 };
    }
  }, [user, trainerId]);

  useEffect(() => {
    if (user && trainerId) {
      fetchAnalytics();
      fetchShortlistedClients();
      fetchShortlistedStats().then(setShortlistedStats);
    } else {
      setAnalytics(null);
      setShortlistedClients([]);
      setShortlistedStats({ total: 0, last7Days: 0 });
      setLoading(false);
    }
  }, [user, trainerId, fetchAnalytics, fetchShortlistedClients, fetchShortlistedStats]);

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
    shortlistedStats,
    loading,
    incrementView,
    incrementLike,
    incrementSave,
    incrementShortlist,
    refetchAnalytics: fetchAnalytics,
    refetchShortlistedClients: fetchShortlistedClients
  };
}