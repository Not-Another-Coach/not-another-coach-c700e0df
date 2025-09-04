import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PositionedAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  position?: { x: number; y: number; scale: number };
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
  '2xl': 'h-32 w-32'
};

export const PositionedAvatar = ({ 
  src, 
  alt, 
  fallback = 'PT',
  position = { x: 50, y: 50, scale: 1 },
  className,
  size = 'xl'
}: PositionedAvatarProps) => {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && position ? (
        <div className="w-full h-full rounded-full overflow-hidden relative">
          <img
            src={src}
            alt={alt || 'Profile'}
            className="absolute w-full h-full object-cover transition-transform duration-200"
            style={{
              width: `${position.scale * 100}%`,
              height: `${position.scale * 100}%`,
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      ) : src ? (
        <AvatarImage src={src} alt={alt} />
      ) : null}
      <AvatarFallback className="text-lg font-medium">{fallback}</AvatarFallback>
    </Avatar>
  );
};