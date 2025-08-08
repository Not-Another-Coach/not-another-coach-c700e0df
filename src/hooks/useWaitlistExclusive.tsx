import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useWaitlistExclusive() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const startExclusivePeriod = useCallback(async (coachId: string, durationHours: number = 48) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('start_waitlist_exclusive_period', {
        p_coach_id: coachId,
        p_duration_hours: durationHours
      });

      if (error) throw error;

      toast({
        title: "Waitlist exclusive access started",
        description: `Your availability is now exclusive to waitlist clients for ${durationHours} hours.`,
      });

      return { success: true, periodId: data };
    } catch (error) {
      console.error('Error starting exclusive period:', error);
      toast({
        title: "Error",
        description: "Failed to start waitlist exclusive access. Please try again.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const endExclusivePeriod = useCallback(async (coachId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('end_waitlist_exclusive_period', {
        p_coach_id: coachId
      });

      if (error) throw error;

      toast({
        title: "Exclusive period ended",
        description: "Your availability is now public to all clients.",
      });

      return { success: true };
    } catch (error) {
      console.error('Error ending exclusive period:', error);
      toast({
        title: "Error",
        description: "Failed to end exclusive period. Please try again.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const checkClientExclusiveAccess = useCallback(async (clientId: string, coachId: string) => {
    try {
      const { data, error } = await supabase.rpc('client_has_waitlist_exclusive_access', {
        p_client_id: clientId,
        p_coach_id: coachId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking exclusive access:', error);
      return false;
    }
  }, []);

  const getActiveExclusivePeriods = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist_exclusive_periods')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching exclusive periods:', error);
      return [];
    }
  }, []);

  return {
    loading,
    startExclusivePeriod,
    endExclusivePeriod,
    checkClientExclusiveAccess,
    getActiveExclusivePeriods
  };
}