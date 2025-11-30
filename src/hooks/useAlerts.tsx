import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { queryConfig } from '@/lib/queryConfig';

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
  const queryClient = useQueryClient();

  const { data: alertsData, isLoading: loading } = useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: async () => {
      if (!user) return { alerts: [], unviewedCount: 0 };

      const [alertsRes, interactionsRes] = await Promise.all([
        supabase
          .from('alerts')
          .select('*')
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('user_alert_interactions')
          .select('alert_id, interaction_type')
          .eq('user_id', user.id)
      ]);

      if (alertsRes.error) throw alertsRes.error;

      const dismissedAlertIds = new Set(
        interactionsRes.data?.filter(i => i.interaction_type === 'dismissed').map(i => i.alert_id) || []
      );
      
      const viewedAlertIds = new Set(
        interactionsRes.data?.filter(i => i.interaction_type === 'viewed').map(i => i.alert_id) || []
      );

      const filteredAlerts = alertsRes.data?.filter(
        alert => !dismissedAlertIds.has(alert.id)
      ).map(alert => ({
        ...alert,
        is_dismissed: false
      })) || [];

      const unviewed = filteredAlerts.filter(alert => !viewedAlertIds.has(alert.id));

      return {
        alerts: filteredAlerts,
        unviewedCount: unviewed.length
      };
    },
    enabled: !!user,
    staleTime: queryConfig.lists.staleTime,
    gcTime: queryConfig.lists.gcTime,
    refetchOnMount: false,
  });

  const alerts = alertsData?.alerts || [];
  const unviewedCount = alertsData?.unviewedCount || 0;

  const markAsViewedMutation = useMutation({
    mutationFn: async (alertIds: string[]) => {
      if (!user || alertIds.length === 0) throw new Error('Invalid parameters');

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

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(['alerts', user?.id], (old: any) => ({
        ...old,
        unviewedCount: 0
      }));
    }
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_alert_interactions')
        .insert({
          user_id: user.id,
          alert_id: alertId,
          interaction_type: 'dismissed'
        });

      if (error) throw error;
      return alertId;
    },
    onSuccess: (alertId) => {
      queryClient.setQueryData(['alerts', user?.id], (old: any) => ({
        alerts: old?.alerts.filter((alert: Alert) => alert.id !== alertId) || [],
        unviewedCount: Math.max(0, (old?.unviewedCount || 0) - 1)
      }));
    }
  });

  const markAsClickedMutation = useMutation({
    mutationFn: async (alertId: string) => {
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('user_alert_interactions')
        .insert({
          user_id: user.id,
          alert_id: alertId,
          interaction_type: 'clicked'
        });
    }
  });

  const markAsViewed = async (alertIds: string[]) => {
    await markAsViewedMutation.mutateAsync(alertIds);
  };

  const dismissAlert = async (alertId: string) => {
    await dismissAlertMutation.mutateAsync(alertId);
  };

  const markAsClicked = async (alertId: string) => {
    await markAsClickedMutation.mutateAsync(alertId);
  };

  return {
    alerts,
    loading,
    unviewedCount,
    dismissAlert,
    markAsClicked,
    markAsViewed,
    refetchAlerts: () => queryClient.invalidateQueries({ queryKey: ['alerts', user?.id] }),
  };
}