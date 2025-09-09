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
  | 'professional_milestones';

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
  | 'browsing'
  | 'liked'
  | 'shortlisted'
  | 'discovery_process'
  | 'committed'
  | 'rejected';

interface VisibilityMatrixHook {
  getContentVisibility: (
    trainerId: string, 
    contentType: ContentType, 
    engagementStage: EngagementStage
  ) => Promise<VisibilityState>;
  getContentVisibilityByGroup: (
    trainerId: string,
    contentType: ContentType,
    stageGroup: EngagementStageGroup
  ) => Promise<VisibilityState>;
  updateVisibilitySettings: (
    trainerId: string,
    contentType: ContentType,
    engagementStage: EngagementStage,
    visibilityState: VisibilityState
  ) => Promise<{ error?: any }>;
  updateVisibilityByGroup: (
    trainerId: string,
    contentType: ContentType,
    stageGroup: EngagementStageGroup,
    visibilityState: VisibilityState
  ) => Promise<{ error?: any }>;
  initializeDefaults: (trainerId: string) => Promise<{ error?: any }>;
  loading: boolean;
}

export function useVisibilityMatrix(): VisibilityMatrixHook {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Stage group mapping
  const stageGroupMapping: Record<EngagementStageGroup, EngagementStage[]> = {
    browsing: ['browsing'],
    liked: ['liked'],
    shortlisted: ['shortlisted'],
    discovery_process: ['getting_to_know_your_coach', 'discovery_in_progress', 'matched'],
    committed: ['discovery_completed', 'agreed', 'payment_pending', 'active_client'],
    rejected: ['unmatched', 'declined', 'declined_dismissed']
  };

  const getContentVisibility = useCallback(async (
    trainerId: string,
    contentType: ContentType,
    engagementStage: EngagementStage
  ): Promise<VisibilityState> => {
    try {
      const { data, error } = await supabase.rpc('get_content_visibility', {
        p_trainer_id: trainerId,
        p_content_type: contentType,
        p_engagement_stage: engagementStage as any // Type cast needed until Supabase regenerates types
      });

      if (error) {
        console.error('Error getting content visibility:', error);
        // Fallback to system defaults
        const stageGroup = Object.entries(stageGroupMapping).find(([_, stages]) => 
          stages.includes(engagementStage)
        )?.[0] as EngagementStageGroup;
        
        if (stageGroup) {
          return await VisibilityConfigService.getDefaultVisibility(contentType, stageGroup);
        }
        return 'hidden'; // Safe default
      }

      return data as VisibilityState;
    } catch (error) {
      console.error('Error getting content visibility:', error);
      // Fallback to system defaults
      const stageGroup = Object.entries(stageGroupMapping).find(([_, stages]) => 
        stages.includes(engagementStage)
      )?.[0] as EngagementStageGroup;
      
      if (stageGroup) {
        return await VisibilityConfigService.getDefaultVisibility(contentType, stageGroup);
      }
      return 'hidden'; // Safe default
    }
  }, [stageGroupMapping]);

  const updateVisibilitySettings = useCallback(async (
    trainerId: string,
    contentType: ContentType,
    engagementStage: EngagementStage,
    visibilityState: VisibilityState
  ) => {
    if (!user) return { error: 'User not authenticated' };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('trainer_visibility_settings')
        .upsert({
          trainer_id: trainerId,
          content_type: contentType,
          engagement_stage: engagementStage as any, // Type cast needed until Supabase regenerates types
          visibility_state: visibilityState
        }, {
          onConflict: 'trainer_id,content_type,engagement_stage'
        });

      if (error) {
        console.error('Error updating visibility settings:', error);
        return { error };
      }

      return {};
    } catch (error) {
      console.error('Error updating visibility settings:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const initializeDefaults = useCallback(async (trainerId: string) => {
    if (!user) return { error: 'User not authenticated' };

    setLoading(true);
    try {
      const { error } = await supabase.rpc('initialize_trainer_visibility_defaults', {
        p_trainer_id: trainerId
      });

      if (error) {
        console.error('Error initializing visibility defaults:', error);
        return { error };
      }

      return {};
    } catch (error) {
      console.error('Error initializing visibility defaults:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getContentVisibilityByGroup = useCallback(async (
    trainerId: string,
    contentType: ContentType,
    stageGroup: EngagementStageGroup
  ): Promise<VisibilityState> => {
    try {
      const { data, error } = await supabase.rpc('get_content_visibility_by_group', {
        p_trainer_id: trainerId,
        p_content_type: contentType,
        p_stage_group: stageGroup as any // Type cast needed until Supabase regenerates types
      });

      if (error) {
        console.error('Error getting content visibility by group:', error);
        // Fallback to system defaults
        const fallbackVisibility = await VisibilityConfigService.getDefaultVisibility(contentType, stageGroup);
        console.log('useVisibilityMatrix Debug - Using Fallback:', {
          trainerId,
          contentType,
          stageGroup,
          fallbackVisibility,
          error
        });
        return fallbackVisibility;
      }

      // Debug successful RPC call
      if (contentType === 'gallery_images') {
        console.log('useVisibilityMatrix Debug - RPC Success:', {
          trainerId,
          contentType,
          stageGroup,
          rpcResult: data
        });
      }

      return data as VisibilityState;
    } catch (error) {
      console.error('Error getting content visibility by group:', error);
      // Fallback to system defaults
      return await VisibilityConfigService.getDefaultVisibility(contentType, stageGroup);
    }
  }, []);

  const updateVisibilityByGroup = useCallback(async (
    trainerId: string,
    contentType: ContentType,
    stageGroup: EngagementStageGroup,
    visibilityState: VisibilityState
  ) => {
    if (!user) return { error: 'User not authenticated' };

    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_visibility_for_group', {
        p_trainer_id: trainerId,
        p_content_type: contentType,
        p_stage_group: stageGroup as any, // Type cast needed until Supabase regenerates types
        p_visibility_state: visibilityState
      });

      if (error) {
        console.error('Error updating visibility by group:', error);
        return { error };
      }

      return {};
    } catch (error) {
      console.error('Error updating visibility by group:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    getContentVisibility,
    getContentVisibilityByGroup,
    updateVisibilitySettings,
    updateVisibilityByGroup,
    initializeDefaults,
    loading
  };
}