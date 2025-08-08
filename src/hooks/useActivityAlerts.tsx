import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

interface ActivityAlert {
  id: string;
  type: 'discovery_call_booked' | 'discovery_call_cancelled' | 'discovery_call_rescheduled' | 'client_inquiry' | 'profile_view' | 'testimonial' | 'conversion' | 'waitlist_joined' | 'coach_selection_request' | 'coach_selection_sent';
  title: string;
  description: string;
  metadata?: any;
  created_at: string;
  icon: string;
  color: string;
}

export function useActivityAlerts() {
  const [alerts, setAlerts] = useState<ActivityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (user) {
      fetchAlerts();
      
      // Set up real-time subscription for alerts
      const channel = supabase
        .channel('alerts-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts'
          },
          (payload) => {
            console.log('🔔 New alert received via realtime:', payload);
            // Refresh alerts when a new one is inserted
            fetchAlerts();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'alerts'
          },
          (payload) => {
            console.log('📝 Alert updated via realtime:', payload);
            // Refresh alerts when one is updated
            fetchAlerts();
          }
        )
        .subscribe((status) => {
          console.log('🟢 Realtime subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;
    
    console.log('Fetching alerts for user:', user.id);
    setLoading(true);
    try {
      const { data: alertsData, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('Alerts query result:', { alertsData, error });

      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }

      // Transform alerts data and filter based on user type and targeting
      const transformedAlerts: ActivityAlert[] = (alertsData || [])
        .filter(alert => {
          // For clients, show their own selection confirmations
          if (profile?.user_type === 'client') {
            // Check if this is a coach selection sent alert specifically for this client
            if (alert.alert_type === 'coach_selection_sent') {
              const targetAudience = alert.target_audience as any;
              if (targetAudience?.clients && Array.isArray(targetAudience.clients)) {
                return targetAudience.clients.includes(user.id);
              }
            }
            // Filter out discovery call alerts for clients
            const discoveryCallTypes = ['discovery_call_booked', 'discovery_call_cancelled', 'discovery_call_rescheduled'];
            return !discoveryCallTypes.includes(alert.alert_type);
          }
          
          // For trainers, show alerts targeted to them
          if (profile?.user_type === 'trainer') {
            // Show alerts where user is the creator (coach) or specifically targeted
            if (alert.created_by === user.id) return true;
            
            // Type-safe checking of target_audience
            const targetAudience = alert.target_audience as any;
            if (targetAudience?.coaches && Array.isArray(targetAudience.coaches)) {
              return targetAudience.coaches.includes(user.id);
            }
            // Show general trainer alerts
            if (targetAudience?.trainers) return true;
          }
          
          return true;
        })
        .map(alert => ({
          id: alert.id,
          type: alert.alert_type as any,
          title: alert.title,
          description: alert.content,
          metadata: alert.metadata,
          created_at: alert.created_at,
          icon: getIconForType(alert.alert_type),
          color: getColorForType(alert.alert_type)
        }));

      setAlerts(transformedAlerts);
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (
    type: ActivityAlert['type'],
    title: string,
    description: string,
    metadata?: any
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('alerts')
        .insert({
          alert_type: type,
          title,
          content: description,
          created_by: user.id,
          target_audience: ["trainers"],
          metadata: metadata || {},
          is_active: true
        });

      if (error) {
        console.error('Error creating alert:', error);
        return false;
      }

      // Refresh alerts
      await fetchAlerts();
      return true;
    } catch (error) {
      console.error('Error in createAlert:', error);
      return false;
    }
  };

  const getIconForType = (type: string): string => {
    switch (type) {
      case 'discovery_call_booked':
        return '📞';
      case 'discovery_call_cancelled':
        return '❌';
      case 'discovery_call_rescheduled':
        return '🔄';
      case 'client_inquiry':
        return '💬';
      case 'profile_view':
        return '👀';
      case 'testimonial':
        return '🎉';
      case 'conversion':
        return '📈';
      case 'waitlist_joined':
        return '⏰';
      case 'coach_selection_request':
        return '🎯';
      case 'coach_selection_sent':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getColorForType = (type: string): string => {
    switch (type) {
      case 'discovery_call_booked':
        return 'bg-blue-50 border-blue-200';
      case 'discovery_call_cancelled':
        return 'bg-red-50 border-red-200';
      case 'discovery_call_rescheduled':
        return 'bg-orange-50 border-orange-200';
      case 'client_inquiry':
        return 'bg-green-50 border-green-200';
      case 'profile_view':
        return 'bg-purple-50 border-purple-200';
      case 'testimonial':
        return 'bg-yellow-50 border-yellow-200';
      case 'conversion':
        return 'bg-orange-50 border-orange-200';
      case 'waitlist_joined':
        return 'bg-amber-50 border-amber-200';
      case 'coach_selection_request':
        return 'bg-blue-50 border-blue-200';
      case 'coach_selection_sent':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return {
    alerts,
    loading,
    createAlert,
    refetch: fetchAlerts
  };
}