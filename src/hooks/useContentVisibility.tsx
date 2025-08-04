import { useState, useEffect, useMemo } from 'react';
import { useVisibilityMatrix, ContentType, VisibilityState, EngagementStage } from './useVisibilityMatrix';

interface UseContentVisibilityProps {
  trainerId: string;
  engagementStage: EngagementStage;
}

interface ContentVisibilityMap {
  profile_image: VisibilityState;
  before_after_images: VisibilityState;
  package_images: VisibilityState;
  testimonial_images: VisibilityState;
  certification_images: VisibilityState;
  gallery_images: VisibilityState;
}

export function useContentVisibility({ trainerId, engagementStage }: UseContentVisibilityProps) {
  const { getContentVisibility } = useVisibilityMatrix();
  const [visibilityMap, setVisibilityMap] = useState<ContentVisibilityMap>({
    profile_image: 'hidden',
    before_after_images: 'hidden',
    package_images: 'hidden',
    testimonial_images: 'hidden',
    certification_images: 'hidden',
    gallery_images: 'hidden'
  });
  const [loading, setLoading] = useState(true);

  const contentTypes: ContentType[] = [
    'profile_image',
    'before_after_images', 
    'package_images',
    'testimonial_images',
    'certification_images',
    'gallery_images'
  ];

  useEffect(() => {
    const fetchVisibilityStates = async () => {
      if (!trainerId || !engagementStage) return;
      
      setLoading(true);
      try {
        const visibilityPromises = contentTypes.map(async (contentType) => {
          const visibility = await getContentVisibility(trainerId, contentType, engagementStage);
          return { contentType, visibility };
        });

        const results = await Promise.all(visibilityPromises);
        
        const newVisibilityMap = results.reduce((acc, { contentType, visibility }) => {
          acc[contentType] = visibility;
          return acc;
        }, {} as ContentVisibilityMap);

        setVisibilityMap(newVisibilityMap);
      } catch (error) {
        console.error('Error fetching visibility states:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisibilityStates();
  }, [trainerId, engagementStage, getContentVisibility]);

  // Helper functions for common visibility checks
  const canViewContent = useMemo(() => ({
    profileImage: visibilityMap.profile_image === 'visible',
    beforeAfterImages: visibilityMap.before_after_images === 'visible',
    packageImages: visibilityMap.package_images === 'visible',
    testimonialImages: visibilityMap.testimonial_images === 'visible',
    certificationImages: visibilityMap.certification_images === 'visible',
    galleryImages: visibilityMap.gallery_images === 'visible',
    
    // Pricing related visibility (packages are considered pricing-sensitive)
    pricing: visibilityMap.package_images === 'visible'
  }), [visibilityMap]);

  const getVisibility = (contentType: ContentType): VisibilityState => {
    return visibilityMap[contentType];
  };

  const isContentBlurred = (contentType: ContentType): boolean => {
    return visibilityMap[contentType] === 'blurred';
  };

  const isContentHidden = (contentType: ContentType): boolean => {
    return visibilityMap[contentType] === 'hidden';
  };

  const isContentVisible = (contentType: ContentType): boolean => {
    return visibilityMap[contentType] === 'visible';
  };

  return {
    visibilityMap,
    canViewContent,
    getVisibility,
    isContentBlurred,
    isContentHidden,
    isContentVisible,
    loading
  };
}