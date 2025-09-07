import { useMemo } from 'react';
import { useMyTrainers } from '@/hooks/useMyTrainers';
import { useTrainerEngagement } from '@/hooks/useTrainerEngagement';
import { useWaitlist } from '@/hooks/useWaitlist';
import { 
  ClientJourneyStage, 
  JourneyStageCounts, 
  JourneyStageConfig,
  ENGAGEMENT_TO_JOURNEY_MAPPING,
  TrainerWithJourneyStage 
} from '@/types/journey';

export function useClientJourneyVisualization(refreshTrigger?: number) {
  const { trainers: allTrainers, loading: trainersLoading } = useMyTrainers(refreshTrigger);
  const { getEngagementStage, loading: engagementLoading } = useTrainerEngagement(refreshTrigger);
  const { checkClientWaitlistStatus } = useWaitlist();

  // Transform trainers with journey stages
  const trainersWithJourneyStages = useMemo<TrainerWithJourneyStage[]>(() => {
    return allTrainers.map(trainer => {
      const engagementStage = getEngagementStage(trainer.id);
      const isOnWaitlist = checkClientWaitlistStatus(trainer.id);
      
      // Override journey stage if on waitlist
      let journeyStage: ClientJourneyStage;
      if (isOnWaitlist) {
        journeyStage = ClientJourneyStage.WAITLIST;
      } else {
        journeyStage = ENGAGEMENT_TO_JOURNEY_MAPPING[engagementStage] || ClientJourneyStage.DISCOVERY;
      }

      return {
        ...trainer,
        engagement_stage: engagementStage,
        journey_stage: journeyStage
      };
    });
  }, [allTrainers, getEngagementStage, checkClientWaitlistStatus]);

  // Calculate stage counts
  const stageCounts = useMemo<JourneyStageCounts>(() => {
    const counts = {
      discovery: 0,
      saved: 0,
      shortlisted: 0,
      waitlist: 0,
      chosen: 0
    };

    trainersWithJourneyStages.forEach(trainer => {
      counts[trainer.journey_stage]++;
    });

    return counts;
  }, [trainersWithJourneyStages]);

  // Generate stage configs with counts
  const stageConfigs = useMemo<JourneyStageConfig[]>(() => [
    {
      id: ClientJourneyStage.DISCOVERY,
      title: 'Discovery',
      description: 'Exploring trainers',
      color: 'hsl(var(--muted))',
      count: stageCounts.discovery
    },
    {
      id: ClientJourneyStage.SAVED,
      title: 'Saved',
      description: 'Trainers you liked',
      color: 'hsl(var(--primary))',
      count: stageCounts.saved
    },
    {
      id: ClientJourneyStage.SHORTLISTED,
      title: 'Shortlisted',
      description: 'Top trainer choices',
      color: 'hsl(var(--accent))',
      count: stageCounts.shortlisted
    },
    {
      id: ClientJourneyStage.WAITLIST,
      title: 'Waitlist',
      description: 'Waiting for availability',
      color: 'hsl(var(--warning))',
      count: stageCounts.waitlist
    },
    {
      id: ClientJourneyStage.CHOSEN,
      title: 'Chosen',
      description: 'Your selected trainer',
      color: 'hsl(var(--success))',
      count: stageCounts.chosen
    }
  ], [stageCounts]);

  // Get trainers for specific stage
  const getTrainersForStage = (stage: ClientJourneyStage) => {
    return trainersWithJourneyStages.filter(trainer => trainer.journey_stage === stage);
  };

  const loading = trainersLoading || engagementLoading;

  return {
    trainersWithJourneyStages,
    stageCounts,
    stageConfigs,
    getTrainersForStage,
    loading
  };
}