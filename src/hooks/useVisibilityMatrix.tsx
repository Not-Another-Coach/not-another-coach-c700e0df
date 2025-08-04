import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ContentType = 
  | 'profile_image'
  | 'before_after_images' 
  | 'package_images'
  | 'testimonial_images'
  | 'certification_images'
  | 'gallery_images';

export type VisibilityState = 'hidden' | 'blurred' | 'visible';

export type EngagementStage = 
  | 'browsing' 
  | 'liked' 
  | 'matched' 
  | 'discovery_completed' 
  | 'active_client';

interface VisibilityMatrixHook {
  getContentVisibility: (
    trainerId: string, 
    contentType: ContentType, 
    engagementStage: EngagementStage
  ) => Promise<VisibilityState>;
  updateVisibilitySettings: (
    trainerId: string,
    contentType: ContentType,
    engagementStage: EngagementStage,
    visibilityState: VisibilityState
  ) => Promise<{ error?: any }>;
  initializeDefaults: (trainerId: string) => Promise<{ error?: any }>;
  loading: boolean;
}

export function useVisibilityMatrix(): VisibilityMatrixHook {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getContentVisibility = useCallback(async (
    trainerId: string,
    contentType: ContentType,
    engagementStage: EngagementStage
  ): Promise<VisibilityState> => {
    try {
      const { data, error } = await supabase.rpc('get_content_visibility', {
        p_trainer_id: trainerId,
        p_content_type: contentType,
        p_engagement_stage: engagementStage
      });

      if (error) {
        console.error('Error getting content visibility:', error);
        return 'hidden'; // Safe default
      }

      return data as VisibilityState;
    } catch (error) {
      console.error('Error getting content visibility:', error);
      return 'hidden'; // Safe default
    }
  }, []);

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
          engagement_stage: engagementStage,
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

  return {
    getContentVisibility,
    updateVisibilitySettings,
    initializeDefaults,
    loading
  };
}