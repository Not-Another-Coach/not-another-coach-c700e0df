import React from 'react';
import { VisibilityAwareImage } from './VisibilityAwareImage';
import { VisibilityState } from '@/hooks/useVisibilityMatrix';
import { Play, Instagram } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  type: 'uploaded' | 'instagram' | 'profile';
  mediaType: 'IMAGE' | 'VIDEO';
  displayOrder: number;
}

interface VisibilityAwareGalleryProps {
  images: GalleryImage[];
  visibilityState: VisibilityState;
  gridClasses: string;
  className?: string;
  lockMessage?: string;
}

export const VisibilityAwareGallery = ({
  images,
  visibilityState,
  gridClasses,
  className,
  lockMessage = "Gallery unlocks as you engage"
}: VisibilityAwareGalleryProps) => {
  const getVisibleImages = () => {
    switch (visibilityState) {
      case 'hidden':
        // Show only first image as placeholder, or create empty slots
        return images.length > 0 ? [images[0]] : [];
      case 'blurred':
        // Show all images but blurred
        return images;
      case 'visible':
      default:
        // Show all images clearly
        return images;
    }
  };

  const visibleImages = getVisibleImages();
  const shouldShowPlaceholders = visibilityState === 'hidden' && images.length > 1;

  return (
    <div className={`grid gap-1 ${gridClasses} ${className}`}>
      {visibleImages.map((image, index) => (
        <div key={image.id} className="relative overflow-hidden bg-muted">
          <VisibilityAwareImage
            src={image.url}
            alt={`Gallery ${index + 1}`}
            visibilityState={visibilityState}
            lockMessage={lockMessage}
            showLockIcon={index === 0} // Only show lock on first image
          >
            {/* Media type indicators */}
            {image.mediaType === 'VIDEO' && visibilityState === 'visible' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-2">
                  <Play className="h-4 w-4 text-white fill-current" />
                </div>
              </div>
            )}
            
            {/* Instagram badge */}
            {image.type === 'instagram' && visibilityState === 'visible' && (
              <div className="absolute bottom-1 right-1 bg-black/70 rounded-full p-1">
                <Instagram className="h-2 w-2 text-white" />
              </div>
            )}
          </VisibilityAwareImage>
        </div>
      ))}
      
      {/* Show placeholder slots for hidden content */}
      {shouldShowPlaceholders && (
        <>
          {Array.from({ length: Math.min(8, images.length - 1) }).map((_, index) => (
            <div key={`placeholder-${index}`} className="relative overflow-hidden bg-muted">
              <VisibilityAwareImage
                src=""
                alt={`Hidden content ${index + 2}`}
                visibilityState="hidden"
                showLockIcon={false}
                lockMessage=""
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};