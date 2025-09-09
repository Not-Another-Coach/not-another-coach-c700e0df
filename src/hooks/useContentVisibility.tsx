import { useState, useEffect, useMemo } from 'react';
import { useVisibilityMatrix, ContentType, VisibilityState, EngagementStage } from './useVisibilityMatrix';

interface UseContentVisibilityProps {
  trainerId: string;
  engagementStage: EngagementStage;
}

interface ContentVisibilityMap {
  profile_image: VisibilityState;
  basic_information: VisibilityState;
  testimonial_images: VisibilityState;
  gallery_images: VisibilityState;
  specializations: VisibilityState;
  pricing_discovery_call: VisibilityState;
  stats_ratings: VisibilityState;
  description_bio: VisibilityState;
  certifications_qualifications: VisibilityState;
  professional_journey: VisibilityState;
  professional_milestones: VisibilityState;
}

export function useContentVisibility({ trainerId, engagementStage }: UseContentVisibilityProps) {
  const { getContentVisibility } = useVisibilityMatrix();
  const [visibilityMap, setVisibilityMap] = useState<ContentVisibilityMap>({
    profile_image: 'hidden',
    basic_information: 'hidden',
    testimonial_images: 'hidden',
    gallery_images: 'hidden',
    specializations: 'visible', // Default visible types
    pricing_discovery_call: 'hidden',
    stats_ratings: 'visible', // Always visible types
    description_bio: 'visible', // Default visible types
    certifications_qualifications: 'visible', // Default visible types
    professional_journey: 'visible', // Default visible types
    professional_milestones: 'visible' // Default visible types
  });
  const [loading, setLoading] = useState(true);

  const contentTypes: ContentType[] = [
    'profile_image', 'basic_information', 'testimonial_images', 'gallery_images',
    'specializations', 'pricing_discovery_call', 'stats_ratings', 'description_bio',
    'certifications_qualifications', 'professional_journey', 'professional_milestones'
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
        }, {
          // Initialize with defaults
          profile_image: 'hidden',
          basic_information: 'hidden',
          testimonial_images: 'hidden',
          gallery_images: 'hidden',
          specializations: 'visible',
          pricing_discovery_call: 'hidden',
          stats_ratings: 'visible',
          description_bio: 'visible',
          certifications_qualifications: 'visible',
          professional_journey: 'visible',
          professional_milestones: 'visible'
        } as ContentVisibilityMap);

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
    basicInformation: visibilityMap.basic_information === 'visible',
    testimonialImages: visibilityMap.testimonial_images === 'visible',
    galleryImages: visibilityMap.gallery_images === 'visible',
    specializations: visibilityMap.specializations === 'visible',
    pricingDiscoveryCall: visibilityMap.pricing_discovery_call === 'visible',
    statsRatings: visibilityMap.stats_ratings === 'visible',
    descriptionBio: visibilityMap.description_bio === 'visible',
    certificationsQualifications: visibilityMap.certifications_qualifications === 'visible',
    professionalJourney: visibilityMap.professional_journey === 'visible',
    professionalMilestones: visibilityMap.professional_milestones === 'visible',
    
    // Legacy compatibility
    pricing: visibilityMap.pricing_discovery_call === 'visible'
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