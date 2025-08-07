import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useTrainerStreak() {
  const [streakCount, setStreakCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStreakCount();
    }
  }, [user]);

  const fetchStreakCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_trainer_streak_count', {
        trainer_uuid: user.id
      });

      if (error) {
        console.error('Error fetching streak count:', error);
        return;
      }

      setStreakCount(data || 0);
    } catch (error) {
      console.error('Error fetching streak count:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    streakCount,
    loading,
    refetch: fetchStreakCount
  };
}