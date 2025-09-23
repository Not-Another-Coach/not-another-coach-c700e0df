import React from 'react';
import { Lock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisibilityState } from '@/hooks/useVisibilityMatrix';

interface VisibilityAwareTestimonialSectionProps {
  children: React.ReactNode;
  visibilityState: VisibilityState;
  className?: string;
  title?: string;
  itemCount?: number;
  lockMessage?: string;
}

export const VisibilityAwareTestimonialSection = ({
  children,
  visibilityState,
  className,
  title = "Client Testimonials",
  itemCount,
  lockMessage = "Connect with trainer to see client testimonials"
}: VisibilityAwareTestimonialSectionProps) => {
  if (visibilityState === 'hidden') {
    return (
      <div className={cn("border border-dashed border-muted-foreground/30 rounded-lg p-8 text-center", className)}>
        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-muted-foreground mb-2">{title}</h3>
        {itemCount && (
          <p className="text-sm text-muted-foreground mb-2">
            {itemCount} testimonial{itemCount !== 1 ? 's' : ''} available
          </p>
        )}
        <p className="text-sm text-muted-foreground">{lockMessage}</p>
      </div>
    );
  }

  if (visibilityState === 'blurred') {
    return (
      <div className={cn("relative", className)}>
        <div className="blur-md select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm rounded-lg">
          <div className="bg-background/90 rounded-lg p-6 text-center max-w-sm">
            <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-medium text-foreground mb-2">{title}</h3>
            {itemCount && (
              <p className="text-sm text-muted-foreground mb-2">
                {itemCount} testimonial{itemCount !== 1 ? 's' : ''} available
              </p>
            )}
            <p className="text-sm text-muted-foreground">{lockMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};