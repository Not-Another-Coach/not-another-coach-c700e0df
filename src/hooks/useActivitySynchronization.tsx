import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ActivityRecommendation {
  activity_id: string;
  activity_name: string;
  category: string;
  usage_count: number;
  source_packages: string[];
}

export function useActivitySynchronization() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Sync Ways of Working items to activities
  const syncWaysOfWorkingToActivities = useCallback(async (
    packageId: string,
    section: string,
    items: Array<{ id: string; text: string }>
  ) => {
    if (!user?.id) throw new Error('No user authenticated');

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('sync_ways_of_working_to_activities', {
        p_trainer_id: user.id,
        p_package_id: packageId,
        p_section: section,
        p_items: items
      });

      if (error) throw error;

      toast({
        title: "Activities Synced",
        description: `${items.length} items from ${section} section have been synced to your activity library.`,
      });

      return data; // Returns array of activity IDs
    } catch (err) {
      console.error('Error syncing ways of working:', err);
      toast({
        title: "Sync Failed",
        description: "Failed to sync items to activities. Please try again.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

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

  // Sync a new custom activity back to ways of working
  const syncActivityToWaysOfWorking = useCallback(async (
    activityId: string,
    activityName: string,
    category: string
  ) => {
    if (!user?.id) throw new Error('No user authenticated');

    try {
      // Get all package ways of working for this trainer
      const { data: packages, error } = await supabase
        .from('package_ways_of_working')
        .select('*')
        .eq('trainer_id', user.id);

      if (error) throw error;

      // Add the activity to appropriate sections based on category
      const sectionMapping: Record<string, string> = {
        'Onboarding': 'onboarding_items',
        'First Week': 'first_week_items',
        'Ongoing Structure': 'ongoing_structure_items',
        'Tracking Tools': 'tracking_tools_items',
        'Client Expectations': 'client_expectations_items',
        'What I Bring': 'what_i_bring_items'
      };

      const targetSection = sectionMapping[category] || 'onboarding_items';
      
      for (const pkg of packages || []) {
        const currentItems = (pkg[targetSection] as any[]) || [];
        const newItem = { id: `activity-${activityId}`, text: activityName };
        
        // Check if activity is already in the section
        const exists = currentItems.some(item => 
          item.text === activityName || item.id === newItem.id
        );

        if (!exists) {
          const updatedItems = [...currentItems, newItem];
          
          await supabase
            .from('package_ways_of_working')
            .update({ [targetSection]: updatedItems })
            .eq('id', pkg.id);
        }
      }

      toast({
        title: "Activity Added",
        description: `"${activityName}" has been added to your Ways of Working sections.`,
      });
    } catch (err) {
      console.error('Error syncing activity to ways of working:', err);
      toast({
        title: "Sync Failed",
        description: "Failed to sync activity to Ways of Working. Please try again.",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

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
    syncWaysOfWorkingToActivities,
    getActivityRecommendations,
    syncActivityToWaysOfWorking,
    trackActivityUsage
  };
}