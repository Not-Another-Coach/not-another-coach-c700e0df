import React from 'react';

interface ProfileAvatarProps {
  profilePhotoUrl?: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProfileAvatar = ({ 
  profilePhotoUrl, 
  firstName, 
  lastName, 
  size = 'md', 
  className = '' 
}: ProfileAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`;

  if (profilePhotoUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
        <img 
          src={profilePhotoUrl} 
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.nextSibling) {
              (target.nextSibling as HTMLElement).style.display = 'flex';
            }
          }}
        />
        <div 
          className={`${sizeClasses[size]} rounded-full bg-primary/10 items-center justify-center font-medium hidden`}
        >
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-medium ${className}`}>
      {initials}
    </div>
  );
};