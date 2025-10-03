import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Alert {
  id: string;
  title: string;
  content: string;
  alert_type: string;
  priority: number;
  metadata: any;
  created_at: string;
  expires_at: string | null;
  created_by: string | null;
  is_active: boolean;
  target_audience: any;
  updated_at: string;
  is_dismissed?: boolean;
}

export function useAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unviewedCount, setUnviewedCount] = useState(0);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      console.log('🔥 useAlerts: Fetching alerts for user:', user.id);
      
      // Get active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10); // Increased limit to see more alerts

      console.log('🔥 useAlerts: Raw alerts data:', { alertsData, alertsError, alertTypes: alertsData?.map(a => a.alert_type) });

      if (alertsError) {
        console.error('Error fetching alerts:', alertsError);
        return;
      }

      // Get user interactions to filter out dismissed alerts and check viewed status
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('user_alert_interactions')
        .select('alert_id, interaction_type')
        .eq('user_id', user.id);

      if (interactionsError) {
        console.error('Error fetching interactions:', interactionsError);
      }

      const dismissedAlertIds = new Set(
        interactionsData?.filter(i => i.interaction_type === 'dismissed').map(i => i.alert_id) || []
      );
      
      const viewedAlertIds = new Set(
        interactionsData?.filter(i => i.interaction_type === 'viewed').map(i => i.alert_id) || []
      );

      // Filter out dismissed alerts
      const filteredAlerts = alertsData?.filter(
        alert => !dismissedAlertIds.has(alert.id)
      ).map(alert => ({
        ...alert,
        is_dismissed: false
      })) || [];

      setAlerts(filteredAlerts);
      
      // Count unviewed alerts (not dismissed and not viewed)
      const unviewed = filteredAlerts.filter(alert => !viewedAlertIds.has(alert.id));
      setUnviewedCount(unviewed.length);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsViewed = useCallback(async (alertIds: string[]) => {
    if (!user || alertIds.length === 0) return;

    try {
      // Mark all alerts as viewed
      const interactions = alertIds.map(alertId => ({
        user_id: user.id,
        alert_id: alertId,
        interaction_type: 'viewed'
      }));

      const { error } = await supabase
        .from('user_alert_interactions')
        .upsert(interactions, {
          onConflict: 'user_id,alert_id,interaction_type',
          ignoreDuplicates: true
        });

      if (error) {
        console.error('Error marking alerts as viewed:', error);
        return;
      }

      // Update unviewed count locally
      setUnviewedCount(0);
    } catch (error) {
      console.error('Error marking alerts as viewed:', error);
    }
  }, [user]);

  const dismissAlert = useCallback(async (alertId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_alert_interactions')
        .insert({
          user_id: user.id,
          alert_id: alertId,
          interaction_type: 'dismissed'
        });

      if (error) {
        console.error('Error dismissing alert:', error);
        return;
      }

      // Remove from local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  }, [user]);

  const markAsClicked = useCallback(async (alertId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_alert_interactions')
        .insert({
          user_id: user.id,
          alert_id: alertId,
          interaction_type: 'clicked'
        });
    } catch (error) {
      console.error('Error marking alert as clicked:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    } else {
      setAlerts([]);
      setLoading(false);
    }
  }, [user, fetchAlerts]);

  return {
    alerts,
    loading,
    unviewedCount,
    dismissAlert,
    markAsClicked,
    markAsViewed,
    refetchAlerts: fetchAlerts,
  };
}