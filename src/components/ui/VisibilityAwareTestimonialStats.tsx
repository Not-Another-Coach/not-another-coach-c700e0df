import React from 'react';
import { Lock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisibilityState } from '@/hooks/useVisibilityMatrix';

interface TestimonialStatsData {
  [outcome: string]: number;
}

interface VisibilityAwareTestimonialStatsProps {
  stats: TestimonialStatsData;
  visibilityState: VisibilityState;
  className?: string;
  title?: string;
  lockMessage?: string;
}

export const VisibilityAwareTestimonialStats = ({
  stats,
  visibilityState,
  className,
  title = "Specialized Outcomes",
  lockMessage = "Connect with trainer to see detailed results"
}: VisibilityAwareTestimonialStatsProps) => {
  if (visibilityState === 'hidden') {
    return (
      <div className={cn("border border-dashed border-muted-foreground/30 rounded-lg p-6 text-center", className)}>
        <TrendingUp className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <h3 className="font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-1">
          {Object.keys(stats).length} specialized outcome{Object.keys(stats).length !== 1 ? 's' : ''} tracked
        </p>
        <p className="text-sm text-muted-foreground">{lockMessage}</p>
      </div>
    );
  }

  if (visibilityState === 'blurred') {
    const statsContent = (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats).map(([outcome, count]) => (
          <div key={outcome} className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">{outcome}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Clients achieved:</span>
                <span className="font-medium">{count}</span>
              </div>
              <div className="flex justify-between">
                <span>Success rate:</span>
                <span className="font-medium">100%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    return (
      <div className={cn("relative", className)}>
        <div className="blur-sm select-none">{statsContent}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm rounded-lg">
          <div className="bg-background/90 rounded-lg p-4 text-center">
            <Lock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-medium text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{lockMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  // Visible state - show full content
  return (
    <div className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {Object.entries(stats).map(([outcome, count]) => (
        <div key={outcome} className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">{outcome}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Clients achieved:</span>
              <span className="font-medium">{count}</span>
            </div>
            <div className="flex justify-between">
              <span>Success rate:</span>
              <span className="font-medium">100%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};