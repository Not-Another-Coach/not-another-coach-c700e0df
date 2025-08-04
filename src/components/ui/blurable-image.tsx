import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from './button';

export type ImageVisibility = 'hidden' | 'blurred' | 'visible';

interface BlurableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  visibility: ImageVisibility;
  fallbackSrc?: string;
  onVisibilityChange?: (visibility: ImageVisibility) => void;
  showControls?: boolean;
  lockMessage?: string;
  unlockAction?: () => void;
}

export const BlurableImage = React.forwardRef<HTMLImageElement, BlurableImageProps>(
  ({ 
    visibility, 
    fallbackSrc = '/placeholder.svg',
    onVisibilityChange,
    showControls = false,
    lockMessage,
    unlockAction,
    className,
    alt,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleImageError = () => {
      setImageError(true);
    };

    const handleVisibilityToggle = () => {
      if (!onVisibilityChange) return;
      
      const nextVisibility: ImageVisibility = 
        visibility === 'visible' ? 'blurred' : 
        visibility === 'blurred' ? 'hidden' : 'visible';
      
      onVisibilityChange(nextVisibility);
    };

    const getVisibilityIcon = () => {
      switch (visibility) {
        case 'visible': return <Eye className="w-4 h-4" />;
        case 'blurred': return <EyeOff className="w-4 h-4" />;
        case 'hidden': return <Lock className="w-4 h-4" />;
      }
    };

    const shouldShowImage = visibility !== 'hidden' && !imageError;
    const imageSrc = imageError ? fallbackSrc : props.src;

    if (visibility === 'hidden') {
      return (
        <div 
          className={cn(
            "relative aspect-square bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center text-muted-foreground",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Lock className="w-8 h-8 mb-2" />
          <span className="text-sm text-center px-4">
            {lockMessage || "Content locked at this stage"}
          </span>
          
          {unlockAction && (
            <Button 
              variant="outline" 
              size="sm"
              className="mt-3"
              onClick={unlockAction}
            >
              Unlock
            </Button>
          )}
          
          {showControls && (
            <div className={cn(
              "absolute top-2 right-2 transition-opacity",
              isHovered ? "opacity-100" : "opacity-60"
            )}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleVisibilityToggle}
                className="h-8 w-8 p-0"
              >
                {getVisibilityIcon()}
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        className={cn("relative", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {shouldShowImage && (
          <img
            ref={ref}
            {...props}
            src={imageSrc}
            alt={alt}
            onError={handleImageError}
            className={cn(
              "transition-all duration-300",
              visibility === 'blurred' && "blur-md"
            )}
          />
        )}
        
        {visibility === 'blurred' && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Eye className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">
                {lockMessage || "Available after connection"}
              </p>
              {unlockAction && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={unlockAction}
                >
                  Connect to View
                </Button>
              )}
            </div>
          </div>
        )}
        
        {showControls && (
          <div className={cn(
            "absolute top-2 right-2 transition-opacity",
            isHovered ? "opacity-100" : "opacity-60"
          )}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleVisibilityToggle}
              className="h-8 w-8 p-0"
            >
              {getVisibilityIcon()}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

BlurableImage.displayName = "BlurableImage";