import React from 'react';
import { Lock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisibilityState, EngagementStage } from '@/hooks/useVisibilityMatrix';
import { getDisplayNameByEngagement, getDisplayNameByVisibility, TrainerNameData } from '@/utils/nameVisibility';

interface VisibilityAwareBasicInfoProps {
  name?: string;
  location?: string;
  tagline?: string;
  visibilityState: VisibilityState;
  className?: string;
  showLockIcon?: boolean;
  variant?: 'default' | 'overlay'; // overlay for white text on dark backgrounds
  // New props for progressive name visibility
  trainer?: TrainerNameData;
  engagementStage?: EngagementStage;
}

export const VisibilityAwareBasicInfo = ({
  name,
  location,
  tagline,
  visibilityState,
  className,
  showLockIcon = true,
  variant = 'default',
  trainer,
  engagementStage
}: VisibilityAwareBasicInfoProps) => {
  const isOverlay = variant === 'overlay';
  const textColor = isOverlay ? 'text-white' : 'text-foreground';
  const mutedTextColor = isOverlay ? 'text-white/90' : 'text-muted-foreground';
  const lockBgColor = isOverlay ? 'bg-black/20' : 'bg-background/80';
  
  // Determine display name using progressive visibility
  const displayName = trainer && engagementStage 
    ? getDisplayNameByEngagement(trainer, engagementStage, visibilityState)
    : trainer 
    ? getDisplayNameByVisibility(trainer, visibilityState)
    : name; // Fallback to original name prop

  if (visibilityState === 'hidden') {
    return (
      <div className={cn("flex items-center gap-2", mutedTextColor, className)}>
        {showLockIcon && <Lock className="h-3 w-3" />}
        <span className="text-sm">Trainer info unlocks with engagement</span>
      </div>
    );
  }

  if (visibilityState === 'blurred') {
    return (
      <div className={cn("relative", className)}>
        <div className="blur-sm select-none">
          {displayName && <h3 className={cn("font-semibold text-lg", textColor)}>{displayName}</h3>}
          {tagline && <p className={cn("text-sm line-clamp-2 mb-2", mutedTextColor)}>{tagline}</p>}
          {location && (
            <div className={cn("flex items-center gap-1 text-sm", mutedTextColor)}>
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn("backdrop-blur-sm rounded px-2 py-1", lockBgColor)}>
            <Lock className={cn("h-3 w-3", mutedTextColor)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {displayName && <h3 className={cn("font-semibold text-lg", textColor)}>{displayName}</h3>}
      {tagline && <p className={cn("text-sm line-clamp-2 mb-2", mutedTextColor)}>{tagline}</p>}
      {location && (
        <div className={cn("flex items-center gap-1 text-sm", mutedTextColor)}>
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      )}
    </div>
  );
};