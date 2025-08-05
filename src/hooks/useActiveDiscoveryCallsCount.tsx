import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useActiveDiscoveryCallsCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchActiveCallsCount = async () => {
    if (!user) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const now = new Date().toISOString();
      
      const { count: activeCallsCount, error } = await supabase
        .from('discovery_calls')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'scheduled')
        .gte('scheduled_for', now); // Only future calls

      if (error) {
        console.error('Error fetching active discovery calls count:', error);
        setCount(0);
      } else {
        setCount(activeCallsCount || 0);
      }
    } catch (error) {
      console.error('Error in fetchActiveCallsCount:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCallsCount();

    // Set up real-time subscription for discovery calls changes
    const channel = supabase
      .channel('discovery-calls-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discovery_calls'
        },
        (payload) => {
          console.log('🔔 New discovery call created:', payload);
          // Refresh count when a new call is created
          fetchActiveCallsCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'discovery_calls'
        },
        (payload) => {
          console.log('📝 Discovery call updated:', payload);
          // Refresh count when a call is updated (status changed, cancelled, etc.)
          fetchActiveCallsCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'discovery_calls'
        },
        (payload) => {
          console.log('🗑️ Discovery call deleted:', payload);
          // Refresh count when a call is deleted
          fetchActiveCallsCount();
        }
      )
      .subscribe((status) => {
        console.log('🟢 Discovery calls subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    count,
    loading,
    refetch: fetchActiveCallsCount
  };
}