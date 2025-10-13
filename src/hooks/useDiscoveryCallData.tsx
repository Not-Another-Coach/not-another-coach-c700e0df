import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DiscoveryCall {
  id: string;
  trainer_id: string;
  client_id: string;
  scheduled_for: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  booking_notes?: string | null;
  reminder_24h_sent?: string | null;
  reminder_1h_sent?: string | null;
  [key: string]: any; // Allow other database fields
}

export function useDiscoveryCallData() {
  const { user } = useAuth();
  const [discoveryCalls, setDiscoveryCalls] = useState<DiscoveryCall[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiscoveryCalls = async () => {
    if (!user) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('discovery_calls')
        .select('*')
        .eq('client_id', user.id);

      if (error) {
        console.error('Error fetching discovery calls:', error);
        return;
      }

      setDiscoveryCalls(data || []);
    } catch (error) {
      console.error('Error fetching discovery calls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryCalls();
  }, [user]);

  // Get trainers with active discovery calls (scheduled or rescheduled, not cancelled)
  const getTrainersWithActiveDiscoveryCalls = () => {
    return discoveryCalls
      .filter(call => call.status === 'scheduled' || call.status === 'rescheduled')
      .map(call => call.trainer_id);
  };

  // Check if a trainer has an active discovery call
  const hasActiveDiscoveryCall = (trainerId: string) => {
    return discoveryCalls.some(call => 
      call.trainer_id === trainerId && 
      (call.status === 'scheduled' || call.status === 'rescheduled')
    );
  };

  // Get discovery call for a specific trainer
  const getDiscoveryCallForTrainer = (trainerId: string) => {
    return discoveryCalls.find(call => 
      call.trainer_id === trainerId && 
      (call.status === 'scheduled' || call.status === 'rescheduled')
    );
  };

  return {
    discoveryCalls,
    loading,
    getTrainersWithActiveDiscoveryCalls,
    hasActiveDiscoveryCall,
    getDiscoveryCallForTrainer,
    refresh: fetchDiscoveryCalls
  };
}