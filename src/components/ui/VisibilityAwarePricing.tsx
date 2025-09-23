import React from 'react';
import { VisibilityState } from '@/hooks/useVisibilityMatrix';

interface VisibilityAwarePricingProps {
  pricing: string;
  visibilityState: VisibilityState;
  className?: string;
  showEngagementPrompt?: boolean;
  engagementPromptText?: string;
}

export const VisibilityAwarePricing = ({
  pricing,
  visibilityState,
  className = '',
  showEngagementPrompt = false,
  engagementPromptText = 'Pricing available after shortlisting'
}: VisibilityAwarePricingProps) => {
  // For blurred or hidden states, show "TBC" instead of blur
  if (visibilityState === 'blurred' || visibilityState === 'hidden') {
    return (
      <div className={className}>
        <span className="text-muted-foreground font-medium">TBC</span>
        {showEngagementPrompt && (
          <div className="text-xs text-muted-foreground mt-1">
            {engagementPromptText}
          </div>
        )}
      </div>
    );
  }

  // For visible state, show actual pricing
  return (
    <div className={className}>
      {pricing}
    </div>
  );
};