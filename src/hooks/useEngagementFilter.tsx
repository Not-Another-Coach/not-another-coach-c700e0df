import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { queryConfig } from '@/lib/queryConfig';

type EngagementStage = 'browsing' | 'liked' | 'shortlisted' | 'waitlist' | 'matched' | 'getting_to_know_your_coach' | 'discovery_in_progress' | 'discovery_completed' | 'active_client';

interface EngagementFilterResult {
  trainersByStage: Record<EngagementStage, any[]>;
  loading: boolean;
  refreshEngagements: () => Promise<void>;
}

export function useEngagementFilter() {
  const { user } = useAuth();

  const { data: trainersByStage = {
    browsing: [],
    liked: [],
    shortlisted: [],
    waitlist: [],
    matched: [],
    getting_to_know_your_coach: [],
    discovery_in_progress: [],
    discovery_completed: [],
    active_client: []
  }, isLoading: loading, refetch } = useQuery({
    queryKey: ['client-engagements', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          browsing: [],
          liked: [],
          shortlisted: [],
          waitlist: [],
          matched: [],
          getting_to_know_your_coach: [],
          discovery_in_progress: [],
          discovery_completed: [],
          active_client: []
        };
      }

      const { data: engagements, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select(`
          *,
          trainer:profiles!client_trainer_engagement_trainer_id_fkey(*)
        `)
        .eq('client_id', user.id);

      if (engagementError) {
        console.error('Error fetching engagements:', engagementError);
        throw engagementError;
      }

      const grouped: Record<EngagementStage, any[]> = {
        browsing: [],
        liked: [],
        shortlisted: [],
        waitlist: [],
        matched: [],
        getting_to_know_your_coach: [],
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

      return grouped;
    },
    enabled: !!user?.id,
    staleTime: queryConfig.lists.staleTime,
    gcTime: queryConfig.lists.gcTime,
    refetchOnMount: false,
    select: (data) => data
  });

  return {
    trainersByStage,
    loading,
    refreshEngagements: refetch
  };
}