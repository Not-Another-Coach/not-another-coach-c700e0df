import React from 'react';
import { useAppLogo } from '@/hooks/useAppLogo';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AppLogo({ 
  size = 'md', 
  showText = true, 
  onClick,
  className = '' 
}: AppLogoProps) {
  const { logoSettings, loading } = useAppLogo();

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-4xl'
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-muted animate-pulse`} />
        {showText && (
          <div className="h-6 w-16 bg-muted rounded animate-pulse" />
        )}
      </div>
    );
  }

  const handleClick = onClick ? { onClick, role: 'button', tabIndex: 0 } : {};

  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      {...handleClick}
    >
      <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center overflow-hidden`}>
        {logoSettings.logo_url ? (
          <img 
            src={logoSettings.logo_url} 
            alt={`${logoSettings.app_name} logo`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to text logo if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-bold ${size === 'lg' ? 'text-lg' : size === 'md' ? 'text-sm' : 'text-xs'}">${logoSettings.fallback_text}</div>`;
              }
            }}
          />
        ) : (
          <div className={`w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-bold ${size === 'lg' ? 'text-lg' : size === 'md' ? 'text-sm' : 'text-xs'}`}>
            {logoSettings.fallback_text}
          </div>
        )}
      </div>
      {showText && (
        <div className={`font-bold ${textSizeClasses[size]} text-foreground`}>
          {logoSettings.app_name}
        </div>
      )}
    </div>
  );
}