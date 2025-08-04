import React from 'react';
import { BlurableImage, ImageVisibility } from './blurable-image';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface ProfileImageProps {
  src?: string | null;
  alt?: string;
  visibility: ImageVisibility;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  fallbackInitials?: string;
  lockMessage?: string;
  unlockAction?: () => void;
  showControls?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  alt = 'Profile',
  visibility,
  size = 'md',
  variant = 'circle',
  fallbackInitials,
  lockMessage,
  unlockAction,
  showControls = false,
  className
}) => {
  if (variant === 'circle') {
    return (
      <div className={cn('relative', className)}>
        <Avatar className={cn(sizeClasses[size])}>
          <AvatarImage 
            src={src || undefined} 
            alt={alt}
            className={cn(
              'transition-all duration-300',
              visibility === 'blurred' && 'blur-md'
            )}
          />
          <AvatarFallback className="bg-muted text-muted-foreground">
            {fallbackInitials ? (
              <span className="text-sm font-medium">
                {fallbackInitials.slice(0, 2).toUpperCase()}
              </span>
            ) : (
              <User className="w-1/2 h-1/2" />
            )}
          </AvatarFallback>
        </Avatar>
        
        {visibility === 'blurred' && src && (
          <div className="absolute inset-0 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-muted-foreground text-xs">
              <span>Locked</span>
            </div>
          </div>
        )}
        
        {visibility === 'hidden' && (
          <div className="absolute inset-0 rounded-full bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
            <User className="w-1/2 h-1/2 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }

  return (
    <BlurableImage
      src={src || undefined}
      alt={alt}
      visibility={visibility}
      lockMessage={lockMessage}
      unlockAction={unlockAction}
      showControls={showControls}
      className={cn(
        'rounded-lg object-cover',
        sizeClasses[size],
        className
      )}
    />
  );
};