import React from 'react';
import { Star, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisibilityState } from '@/hooks/useVisibilityMatrix';

interface VisibilityAwareRatingProps {
  rating: number;
  reviewCount?: number;
  visibilityState: VisibilityState;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VisibilityAwareRating = ({
  rating,
  reviewCount,
  visibilityState,
  className,
  size = 'md'
}: VisibilityAwareRatingProps) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const starSize = sizeClasses[size];
  
  if (visibilityState === 'hidden') {
    return (
      <div className={cn("flex items-center gap-1 text-muted-foreground", className)}>
        <Lock className="h-3 w-3" />
        <span className="text-sm">Rating hidden</span>
      </div>
    );
  }

  const content = (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : star <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-muted text-muted-foreground"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      {reviewCount && (
        <span className="text-sm text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );

  if (visibilityState === 'blurred') {
    return (
      <div className={cn("relative", className)}>
        <div className="blur-sm select-none">{content}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1">
            <Lock className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return content;
};