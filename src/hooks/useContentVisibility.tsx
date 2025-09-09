import { useState, useEffect, useMemo } from 'react';
import { useVisibilityMatrix, ContentType, VisibilityState, EngagementStage, EngagementStageGroup } from './useVisibilityMatrix';

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
  const { getContentVisibility, getContentVisibilityByGroup } = useVisibilityMatrix();
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

  // Map individual stages to groups
  const getStageGroup = (stage: EngagementStage): EngagementStageGroup => {
    if (stage === 'browsing') return 'browsing';
    if (stage === 'liked') return 'liked';
    if (stage === 'shortlisted') return 'shortlisted';
    if (['getting_to_know_your_coach', 'discovery_in_progress', 'matched'].includes(stage)) {
      return 'discovery_process';
    }
    if (['discovery_completed', 'agreed', 'payment_pending', 'active_client'].includes(stage)) {
      return 'committed';
    }
    if (['unmatched', 'declined', 'declined_dismissed'].includes(stage)) {
      return 'rejected';
    }
    return 'browsing'; // fallback
  };

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
        const stageGroup = getStageGroup(engagementStage);
        
        const visibilityPromises = contentTypes.map(async (contentType) => {
          // Use group-based visibility check for better performance
          const visibility = await getContentVisibilityByGroup(trainerId, contentType, stageGroup);
          
          // Debug visibility fetching
          if (contentType === 'gallery_images') {
            console.log('useContentVisibility Debug - Gallery Images:', {
              trainerId,
              contentType,
              stageGroup,
              engagementStage,
              visibility
            });
          }
          
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
  }, [trainerId, engagementStage, getContentVisibilityByGroup]);

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