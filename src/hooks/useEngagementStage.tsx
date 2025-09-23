import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type EngagementStage = 'browsing' | 'liked' | 'shortlisted' | 'getting_to_know_your_coach' | 'discovery_in_progress' | 'discovery_completed' | 'agreed' | 'payment_pending' | 'active_client' | 'unmatched' | 'declined' | 'declined_dismissed';

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

export function useEngagementStage(trainerId: string, forceGuestMode: boolean = false) {
  const { user } = useAuth();
  const [stage, setStage] = useState<EngagementStage>('browsing');
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const fetchEngagementStage = useCallback(async () => {
    if (!user || !trainerId || forceGuestMode) {
      // Anonymous users or forced guest mode should be treated as guests
      setStage('browsing'); // Keep stage as browsing for internal logic
      setIsGuest(!user || forceGuestMode); // But track guest status separately
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
        // Convert old stages to new ones
        const normalizedStage = data?.stage === 'waitlist' ? 'browsing' : 
                               data?.stage === 'matched' ? 'agreed' : 
                               data?.stage || 'browsing';
        
        const normalizedData = data ? {
          ...data,
          stage: normalizedStage as EngagementStage
        } : null;
        
        setEngagementData(normalizedData);
        setStage(normalizedStage as EngagementStage);
      }
    } catch (error) {
      console.error('Error fetching engagement stage:', error);
      setStage('browsing');
    } finally {
      setLoading(false);
    }
  }, [user, trainerId, forceGuestMode]);

  useEffect(() => {
    fetchEngagementStage();
  }, [fetchEngagementStage]);

  const updateEngagementStage = useCallback(async (newStage: EngagementStage) => {
    if (!user || !trainerId || forceGuestMode) return { error: 'No user or trainer ID' };

    try {
      const { data, error } = await supabase.rpc('update_engagement_stage', {
        client_uuid: user.id,
        trainer_uuid: trainerId,
        new_stage: newStage as any // Type cast needed until Supabase regenerates types
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
  }, [user, trainerId, forceGuestMode, fetchEngagementStage]);

  const canViewContent = useCallback((requiredStage: EngagementStage) => {
    const stageOrder: EngagementStage[] = ['browsing', 'liked', 'shortlisted', 'getting_to_know_your_coach', 'discovery_in_progress', 'discovery_completed', 'agreed', 'payment_pending', 'active_client'];
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
    refetch: fetchEngagementStage,
    isGuest
  };
}