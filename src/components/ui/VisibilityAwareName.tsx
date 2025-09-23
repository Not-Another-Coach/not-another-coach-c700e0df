import React from 'react';
import { cn } from '@/lib/utils';
import { VisibilityState, EngagementStage } from '@/hooks/useVisibilityMatrix';
import { getDisplayNameByEngagement, getDisplayNameByVisibility, TrainerNameData } from '@/utils/nameVisibility';

interface VisibilityAwareNameProps {
  trainer: TrainerNameData;
  visibilityState: VisibilityState;
  engagementStage?: EngagementStage;
  className?: string;
  variant?: 'default' | 'overlay'; // overlay for white text on dark backgrounds
  fallbackName?: string; // fallback if trainer data is incomplete
}

export const VisibilityAwareName = ({
  trainer,
  visibilityState,
  engagementStage,
  className,
  variant = 'default',
  fallbackName
}: VisibilityAwareNameProps) => {
  const isOverlay = variant === 'overlay';
  const textColor = isOverlay ? 'text-white' : 'text-foreground';
  
  // Determine display name using progressive visibility
  const displayName = engagementStage 
    ? getDisplayNameByEngagement(trainer, engagementStage, visibilityState)
    : getDisplayNameByVisibility(trainer, visibilityState);
    
  // Use fallback if no display name is available
  const finalDisplayName = displayName || fallbackName || 'Trainer';
  
  return (
    <span className={cn("font-semibold", textColor, className)}>
      {finalDisplayName}
    </span>
  );
};