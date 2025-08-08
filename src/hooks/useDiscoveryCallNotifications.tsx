import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DiscoveryCallNotification {
  id: string;
  discovery_call_id: string;
  notification_type: string;
  recipient_email: string;
  sent_at: string;
  email_id?: string;
  error_message?: string;
  discovery_call?: {
    id: string;
    scheduled_for: string;
    duration_minutes: number;
    status: string;
    booking_notes?: string;
    client?: {
      first_name: string;
      last_name: string;
    };
    trainer?: {
      first_name: string;
      last_name: string;
    };
  };
}

interface DiscoveryCallActivity {
  id: string;
  scheduled_for: string;
  duration_minutes: number;
  status: string;
  booking_notes?: string;
  client?: {
    first_name: string;
    last_name: string;
  };
  trainer?: {
    first_name: string;
    last_name: string;
  };
  reminder_24h_sent?: string;
  reminder_1h_sent?: string;
}

export function useDiscoveryCallNotifications() {
  const [notifications, setNotifications] = useState<DiscoveryCallNotification[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<DiscoveryCallActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUpcomingCalls();
      
      // Set up real-time subscription for discovery calls
      const callsSubscription = supabase
        .channel('discovery-calls-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'discovery_calls',
            filter: `client_id=eq.${user.id}`,
          },
          () => {
            fetchUpcomingCalls();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'discovery_calls',
            filter: `trainer_id=eq.${user.id}`,
          },
          () => {
            fetchUpcomingCalls();
          }
        )
        .subscribe();

      // Set up real-time subscription for notifications
      const notificationsSubscription = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'discovery_call_notifications',
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        callsSubscription.unsubscribe();
        notificationsSubscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('discovery_call_notifications')
        .select(`
          *,
          discovery_call:discovery_call_id(
            id,
            scheduled_for,
            duration_minutes,
            status,
            booking_notes,
            client:client_id(first_name, last_name),
            trainer:trainer_id(first_name, last_name)
          )
        `)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications((data as any) || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingCalls = async () => {
    if (!user) return;

    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('discovery_calls')
        .select(`
          *,
          client:client_id(first_name, last_name),
          trainer:trainer_id(first_name, last_name)
        `)
        .or(`client_id.eq.${user.id},trainer_id.eq.${user.id}`)
        .eq('status', 'scheduled')
        .gte('scheduled_for', now)
        .order('scheduled_for', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching upcoming calls:', error);
        return;
      }

      setUpcomingCalls((data as any) || []);
    } catch (error) {
      console.error('Error fetching upcoming calls:', error);
    }
  };

  const markCallAsCompleted = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('discovery_calls')
        .update({ status: 'completed' })
        .eq('id', callId);

      if (error) {
        console.error('Error marking call as completed:', error);
        return false;
      }

      // Refresh the upcoming calls
      fetchUpcomingCalls();
      return true;
    } catch (error) {
      console.error('Error marking call as completed:', error);
      return false;
    }
  };

  const cancelCall = async (callId: string, reason?: string) => {
    console.log('🚨 Starting discovery call cancellation via hook for call:', callId);
    console.log('🚨 Cancellation reason:', reason);
    
    try {
      const { data, error } = await supabase
        .from('discovery_calls')
        .update({ 
          status: 'cancelled',
          cancellation_reason: reason 
        })
        .eq('id', callId)
        .select();

      console.log('🚨 Hook update result - data:', data, 'error:', error);

      if (error) {
        console.error('❌ Error cancelling call via hook:', error);
        return false;
      }

      // Send cancellation notification in the background (don't wait for it)
      try {
        await supabase.functions.invoke('send-discovery-call-email', {
          body: {
            type: 'trainer_notification',
            discoveryCallId: callId,
            notificationType: 'cancellation'
          }
        });
        console.log('📧 Cancellation email sent successfully via hook');
      } catch (emailError) {
        console.error('📧 Error sending cancellation email via hook (non-blocking):', emailError);
        // Don't fail the cancellation if emails fail
      }

      // Refresh the upcoming calls
      fetchUpcomingCalls();
      return true;
    } catch (error) {
      console.error('Error cancelling call:', error);
      return false;
    }
  };

  const getNotificationMessage = (notification: DiscoveryCallNotification): string => {
    const call = notification.discovery_call;
    if (!call) return 'Discovery call notification';

    const isTrainer = call.trainer && notification.recipient_email;
    const isClient = call.client && notification.recipient_email;
    
    switch (notification.notification_type) {
      case 'confirmation':
        return `Discovery call confirmed with ${call.trainer?.first_name} ${call.trainer?.last_name}`;
      case 'reminder_24h':
        return `Reminder: Discovery call with ${call.trainer?.first_name} ${call.trainer?.last_name} tomorrow`;
      case 'reminder_1h':
        return `Reminder: Discovery call with ${call.trainer?.first_name} ${call.trainer?.last_name} in 1 hour`;
      case 'trainer_new_booking':
        return `New discovery call booked with ${call.client?.first_name} ${call.client?.last_name}`;
      case 'trainer_cancellation':
        return `Discovery call cancelled by ${call.client?.first_name} ${call.client?.last_name}`;
      case 'trainer_reschedule':
        return `Discovery call rescheduled by ${call.client?.first_name} ${call.client?.last_name}`;
      default:
        return 'Discovery call notification';
    }
  };

  return {
    notifications,
    upcomingCalls,
    loading,
    fetchNotifications,
    fetchUpcomingCalls,
    markCallAsCompleted,
    cancelCall,
    getNotificationMessage
  };
}