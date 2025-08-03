import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type EngagementStage = 'browsing' | 'liked' | 'matched' | 'discovery_completed' | 'active_client';

interface EngagementData {
  id: string;
  client_id: string;
  trainer_id: string;
  stage: EngagementStage;
  liked_at?: string;
  matched_at?: string;
  discovery_completed_at?: string;
  became_client_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useEngagementStage(trainerId: string) {
  const { user } = useAuth();
  const [stage, setStage] = useState<EngagementStage>('browsing');
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEngagementStage = useCallback(async () => {
    if (!user || !trainerId) {
      setStage('browsing');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('client_trainer_engagement')
        .select('*')
        .eq('client_id', user.id)
        .eq('trainer_id', trainerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching engagement stage:', error);
        setStage('browsing');
      } else {
        setEngagementData(data);
        setStage(data?.stage || 'browsing');
      }
    } catch (error) {
      console.error('Error fetching engagement stage:', error);
      setStage('browsing');
    } finally {
      setLoading(false);
    }
  }, [user, trainerId]);

  useEffect(() => {
    fetchEngagementStage();
  }, [fetchEngagementStage]);

  const updateEngagementStage = useCallback(async (newStage: EngagementStage) => {
    if (!user || !trainerId) return { error: 'No user or trainer ID' };

    try {
      const { data, error } = await supabase.rpc('update_engagement_stage', {
        client_uuid: user.id,
        trainer_uuid: trainerId,
        new_stage: newStage
      });

      if (error) {
        console.error('Error updating engagement stage:', error);
        return { error };
      }

      // Refresh engagement data
      await fetchEngagementStage();
      return { success: true };
    } catch (error) {
      console.error('Error updating engagement stage:', error);
      return { error };
    }
  }, [user, trainerId, fetchEngagementStage]);

  const canViewContent = useCallback((requiredStage: EngagementStage) => {
    const stageOrder: EngagementStage[] = ['browsing', 'liked', 'matched', 'discovery_completed', 'active_client'];
    const currentIndex = stageOrder.indexOf(stage);
    const requiredIndex = stageOrder.indexOf(requiredStage);
    return currentIndex >= requiredIndex;
  }, [stage]);

  return {
    stage,
    engagementData,
    loading,
    updateEngagementStage,
    canViewContent,
    refetch: fetchEngagementStage
  };
}