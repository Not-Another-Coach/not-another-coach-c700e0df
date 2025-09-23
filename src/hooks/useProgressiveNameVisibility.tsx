import { useMemo } from 'react';
import { VisibilityState, EngagementStage } from '@/hooks/useVisibilityMatrix';
import { getDisplayNameByEngagement, getDisplayNameByVisibility, TrainerNameData } from '@/utils/nameVisibility';

interface UseProgressiveNameVisibilityProps {
  trainer: TrainerNameData;
  visibilityState: VisibilityState;
  engagementStage?: EngagementStage;
}

export function useProgressiveNameVisibility({
  trainer,
  visibilityState,
  engagementStage
}: UseProgressiveNameVisibilityProps) {
  const displayName = useMemo(() => {
    return engagementStage 
      ? getDisplayNameByEngagement(trainer, engagementStage, visibilityState)
      : getDisplayNameByVisibility(trainer, visibilityState);
  }, [trainer, visibilityState, engagementStage]);

  return {
    displayName,
    isAnonymous: displayName.startsWith('Coach_'),
    isPartialName: displayName.includes('.') && !displayName.startsWith('Coach_'),
    isFullName: !displayName.startsWith('Coach_') && !displayName.includes('.')
  };
}