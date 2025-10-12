import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { VisibilityConfigService } from '@/services/VisibilityConfigService';

export type ContentType = 
  | 'profile_image'
  | 'basic_information'
  | 'testimonial_images'
  | 'gallery_images'
  | 'specializations'
  | 'pricing_discovery_call'
  | 'stats_ratings'
  | 'description_bio'
  | 'certifications_qualifications'
  | 'professional_journey'
  | 'professional_milestones'
  | 'package_ways_of_working';

export type VisibilityState = 'hidden' | 'blurred' | 'visible';

export type EngagementStage = 
  | 'browsing' 
  | 'liked' 
  | 'shortlisted'
  | 'getting_to_know_your_coach'
  | 'discovery_in_progress'
  | 'matched'
  | 'discovery_completed'
  | 'agreed'
  | 'payment_pending'
  | 'active_client'
  | 'unmatched'
  | 'declined'
  | 'declined_dismissed';

export type EngagementStageGroup =
  | 'guest'
  | 'browsing'
  | 'liked'
  | 'shortlisted'
  | 'discovery_process'
  | 'committed'
  | 'rejected';

interface VisibilityMatrixHook {
  getContentVisibility: (
    contentType: ContentType, 
    engagementStage: EngagementStage
  ) => Promise<VisibilityState>;
  getContentVisibilityByGroup: (
    contentType: ContentType,
    stageGroup: EngagementStageGroup
  ) => Promise<VisibilityState>;
  loading: boolean;
}

export function useVisibilityMatrix(): VisibilityMatrixHook {
  const [loading, setLoading] = useState(false);

  // Stage group mapping
  const stageGroupMapping: Record<EngagementStageGroup, EngagementStage[]> = {
    guest: [], // Guests don't have a direct engagement stage
    browsing: ['browsing'],
    liked: ['liked'],
    shortlisted: ['shortlisted'],
    discovery_process: ['getting_to_know_your_coach', 'discovery_in_progress', 'matched'],
    committed: ['discovery_completed', 'agreed', 'payment_pending', 'active_client'],
    rejected: ['unmatched', 'declined', 'declined_dismissed']
  };

  const getContentVisibility = useCallback(async (
    contentType: ContentType,
    engagementStage: EngagementStage
  ): Promise<VisibilityState> => {
    // Map engagement stage to stage group
    const stageGroup = Object.entries(stageGroupMapping).find(([_, stages]) => 
      stages.includes(engagementStage)
    )?.[0] as EngagementStageGroup;
    
    if (stageGroup) {
      return await VisibilityConfigService.getDefaultVisibility(contentType, stageGroup);
    }
    return 'hidden'; // Safe default
  }, [stageGroupMapping]);

  const getContentVisibilityByGroup = useCallback(async (
    contentType: ContentType,
    stageGroup: EngagementStageGroup
  ): Promise<VisibilityState> => {
    return await VisibilityConfigService.getDefaultVisibility(contentType, stageGroup);
  }, []);

  return {
    getContentVisibility,
    getContentVisibilityByGroup,
    loading
  };
}