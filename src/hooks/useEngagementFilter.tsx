import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type EngagementStage = 'browsing' | 'liked' | 'shortlisted' | 'waitlist' | 'matched' | 'discovery_call_booked' | 'discovery_in_progress' | 'discovery_completed' | 'active_client';

interface EngagementFilterResult {
  trainersByStage: Record<EngagementStage, any[]>;
  loading: boolean;
  refreshEngagements: () => Promise<void>;
}

export function useEngagementFilter() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainersByStage, setTrainersByStage] = useState<Record<EngagementStage, any[]>>({
    browsing: [],
    liked: [],
    shortlisted: [],
    waitlist: [],
    matched: [],
    discovery_call_booked: [],
    discovery_in_progress: [],
    discovery_completed: [],
    active_client: []
  });

  const fetchEngagements = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get all engagement records for the current user
      const { data: engagements, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select(`
          *,
          trainer:profiles!client_trainer_engagement_trainer_id_fkey(*)
        `)
        .eq('client_id', user.id);

      if (engagementError) {
        console.error('Error fetching engagements:', engagementError);
        setLoading(false);
        return;
      }

      // Group trainers by engagement stage
      const grouped: Record<EngagementStage, any[]> = {
        browsing: [],
        liked: [],
        shortlisted: [],
        waitlist: [],
        matched: [],
        discovery_call_booked: [],
        discovery_in_progress: [],
        discovery_completed: [],
        active_client: []
      };

      engagements?.forEach(engagement => {
        if (engagement.trainer && grouped[engagement.stage as EngagementStage]) {
          const trainerData = engagement.trainer;
          if (trainerData && typeof trainerData === 'object') {
            grouped[engagement.stage as EngagementStage].push({
              ...(trainerData as any),
              engagement: engagement
            });
          }
        }
      });

      setTrainersByStage(grouped);
    } catch (error) {
      console.error('Error in fetchEngagements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagements();
  }, [user?.id]);

  return {
    trainersByStage,
    loading,
    refreshEngagements: fetchEngagements
  };
}