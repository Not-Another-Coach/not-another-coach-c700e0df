import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisibilityState } from '@/hooks/useVisibilityMatrix';

interface VisibilityAwareTextProps {
  children: React.ReactNode;
  visibilityState: VisibilityState;
  className?: string;
  placeholder?: string;
  showLockIcon?: boolean;
}

export const VisibilityAwareText = ({
  children,
  visibilityState,
  className,
  placeholder = "Content unlocks with engagement",
  showLockIcon = true
}: VisibilityAwareTextProps) => {
  if (visibilityState === 'hidden') {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        {showLockIcon && <Lock className="h-3 w-3" />}
        <span className="text-sm">{placeholder}</span>
      </div>
    );
  }

  if (visibilityState === 'blurred') {
    return (
      <div className={cn("relative", className)}>
        <div className="blur-sm select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1">
            <Lock className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};