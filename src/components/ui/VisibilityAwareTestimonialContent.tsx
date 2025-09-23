import React from 'react';
import { Lock, Users, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisibilityState } from '@/hooks/useVisibilityMatrix';
import { Badge } from '@/components/ui/badge';

interface TestimonialData {
  id: string;
  clientName: string;
  clientQuote: string;
  achievement: string;
  outcomeTags?: string[];
  outcomeTag?: string; // Legacy support
  consentGiven?: boolean;
}

interface VisibilityAwareTestimonialContentProps {
  testimonial: TestimonialData;
  visibilityState: VisibilityState;
  className?: string;
  showFullContent?: boolean;
  lockMessage?: string;
}

export const VisibilityAwareTestimonialContent = ({
  testimonial,
  visibilityState,
  className,
  showFullContent = true,
  lockMessage = "Engage with trainer to see testimonials"
}: VisibilityAwareTestimonialContentProps) => {
  const getTags = () => testimonial.outcomeTags || (testimonial.outcomeTag ? [testimonial.outcomeTag] : []);

  if (visibilityState === 'hidden') {
    return (
      <div className={cn("border border-dashed border-muted-foreground/30 rounded-lg p-4 text-center", className)}>
        <Lock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{lockMessage}</p>
      </div>
    );
  }

  if (visibilityState === 'blurred') {
    return (
      <div className={cn("border rounded-lg p-4 bg-muted/30 relative", className)}>
        <div className="blur-sm select-none">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4" />
            <span className="font-medium text-sm">{testimonial.clientName}</span>
            {getTags().length > 0 && (
              <Badge variant="outline" className="text-xs">
                {getTags()[0]}
              </Badge>
            )}
          </div>
          {showFullContent && (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Achievement:</strong> {testimonial.achievement}
              </p>
              <blockquote className="text-sm italic text-muted-foreground">
                "{testimonial.clientQuote}"
              </blockquote>
            </>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm rounded-lg">
          <div className="bg-background/90 rounded-lg p-3 text-center">
            <Lock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{lockMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  // Visible state - show full content
  return (
    <div className={cn("border rounded-lg p-4 bg-muted/30", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4" />
        <span className="font-medium text-sm">{testimonial.clientName}</span>
        {testimonial.consentGiven && (
          <Badge variant="secondary" className="text-xs">
            Verified
          </Badge>
        )}
        {getTags().length > 0 && (
          <div className="flex flex-wrap gap-1">
            {getTags().map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {showFullContent && (
        <>
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Achievement:</strong> {testimonial.achievement}
          </p>
          <blockquote className="text-sm italic text-muted-foreground">
            <Quote className="h-3 w-3 inline mr-1" />
            "{testimonial.clientQuote}"
          </blockquote>
        </>
      )}
    </div>
  );
};