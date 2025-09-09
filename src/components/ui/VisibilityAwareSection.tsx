import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisibilityState } from '@/hooks/useVisibilityMatrix';

interface VisibilityAwareSectionProps {
  children: React.ReactNode;
  visibilityState: VisibilityState;
  className?: string;
  placeholder?: string;
  title?: string;
}

export const VisibilityAwareSection = ({
  children,
  visibilityState,
  className,
  placeholder = "Section unlocks as you engage",
  title
}: VisibilityAwareSectionProps) => {
  if (visibilityState === 'hidden') {
    return (
      <div className={cn("border border-dashed border-muted-foreground/30 rounded-lg p-6 text-center", className)}>
        <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        {title && <h3 className="font-medium text-muted-foreground mb-1">{title}</h3>}
        <p className="text-sm text-muted-foreground">{placeholder}</p>
      </div>
    );
  }

  if (visibilityState === 'blurred') {
    return (
      <div className={cn("relative", className)}>
        <div className="blur-md select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm rounded-lg">
          <div className="bg-background/90 rounded-lg p-4 text-center">
            <Lock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            {title && <h3 className="font-medium text-foreground mb-1">{title}</h3>}
            <p className="text-sm text-muted-foreground">{placeholder}</p>
          </div>
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};