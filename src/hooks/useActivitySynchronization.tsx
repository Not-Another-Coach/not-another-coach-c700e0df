import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ActivityRecommendation {
  activity_id: string;
  activity_name: string;
  category: string;
  usage_count: number;
  source_packages: string[];
}

export function useActivitySynchronization() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Get activity recommendations for template building
  const getActivityRecommendations = useCallback(async (
    packageIds?: string[]
  ): Promise<ActivityRecommendation[]> => {
    if (!user?.id) throw new Error('No user authenticated');

    try {
      const { data, error } = await supabase.rpc('get_activity_recommendations_for_template', {
        p_trainer_id: user.id,
        p_package_ids: packageIds || null
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting activity recommendations:', err);
      return [];
    }
  }, [user?.id]);

  // Update activity usage in templates
  const trackActivityUsage = useCallback(async (
    templateId: string,
    activityId: string
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('template_activity_usage')
        .upsert({
          template_id: templateId,
          activity_id: activityId,
          usage_count: 1,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'template_id,activity_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        // If it's a conflict, increment the usage count
        if (error.code === '23505') {
          // Get current usage count and increment it
          const { data: current } = await supabase
            .from('template_activity_usage')
            .select('usage_count')
            .eq('template_id', templateId)
            .eq('activity_id', activityId)
            .single();

          const { error: incrementError } = await supabase
            .from('template_activity_usage')
            .update({
              usage_count: (current?.usage_count || 0) + 1,
              last_used_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('template_id', templateId)
            .eq('activity_id', activityId);
          
          if (incrementError) throw incrementError;
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error('Error tracking activity usage:', err);
      // Don't show error to user as this is background tracking
    }
  }, [user?.id]);

  return {
    loading,
    getActivityRecommendations,
    trackActivityUsage
  };
}