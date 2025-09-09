import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisibilityState } from '@/hooks/useVisibilityMatrix';

interface VisibilityAwareImageProps {
  src: string;
  alt: string;
  className?: string;
  visibilityState: VisibilityState;
  showLockIcon?: boolean;
  lockMessage?: string;
  children?: React.ReactNode; // For overlays like play buttons, instagram badges, etc.
}

export const VisibilityAwareImage = ({
  src,
  alt,
  className,
  visibilityState,
  showLockIcon = true,
  lockMessage = "Unlock with engagement",
  children
}: VisibilityAwareImageProps) => {
  const getVisibilityClasses = () => {
    switch (visibilityState) {
      case 'blurred':
        return 'blur-sm';
      case 'hidden':
        return 'bg-muted';
      case 'visible':
      default:
        return '';
    }
  };

  const renderContent = () => {
    if (visibilityState === 'hidden') {
      return (
        <div className={cn("w-full h-full flex flex-col items-center justify-center bg-muted/50", className)}>
          {showLockIcon && (
            <>
              <Lock className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground text-center max-w-24 leading-tight">
                {lockMessage}
              </span>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        <img
          src={src}
          alt={alt}
          className={cn("w-full h-full object-cover", getVisibilityClasses(), className)}
          loading="lazy"
        />
        
        {/* Blur overlay for blurred state */}
        {visibilityState === 'blurred' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="bg-black/70 rounded-full p-2">
              <EyeOff className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
        
        {/* Pass through any children (play buttons, badges, etc.) */}
        {children}
      </div>
    );
  };

  return renderContent();
};