import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWaysOfWorkingCategories } from "@/hooks/useWaysOfWorkingCategories";
import { queryConfig } from "@/lib/queryConfig";

export type TrainerActivity = {
  id: string;
  activity_name: string;
  category: string;
  ways_of_working_category?: string | null;
  is_system: boolean;
  description?: string | null;
  guidance_html?: string | null;
  default_due_days?: number | null;
  default_sla_days?: number | null;
};


export function useTrainerActivities() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getSectionToCategory, categories } = useWaysOfWorkingCategories();

  // Use React Query for caching and deduplication
  const { data: activities = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['trainer-activities', user?.id],
    queryFn: async () => {
      console.log('useTrainerActivities: Fetching activities for user:', user?.id);
      
      // RLS ensures we get: system activities + current trainer's activities
      const { data, error } = await supabase
        .from("trainer_onboarding_activities")
        .select("id, activity_name, category, ways_of_working_category, is_system, description, guidance_html, default_due_days, default_sla_days")
        .order("activity_name");

      if (error) {
        console.error("Error fetching activities:", error);
        throw error;
      }
      
      console.log("Fetched activities:", data?.length, "activities");
      console.log("System activities:", data?.filter(a => a.is_system).length);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: queryConfig.lists.staleTime,
    gcTime: queryConfig.lists.gcTime,
    refetchOnMount: queryConfig.lists.refetchOnMount,
    refetchOnWindowFocus: queryConfig.lists.refetchOnWindowFocus,
    refetchOnReconnect: queryConfig.lists.refetchOnReconnect,
  });

  const error = queryError ? (queryError as Error).message : null;

  const createActivity = async (name: string, category: string, description?: string | null) => {
    if (!user?.id) {
      const msg = "You must be signed in to create activities";
      return { error: msg } as const;
    }

    try {
      const { data, error } = await supabase
        .from("trainer_onboarding_activities")
        .insert({
          trainer_id: user.id,
          activity_name: name,
          category,
          description: description ?? null,
        })
        .select("id, activity_name, category, is_system, description, guidance_html, default_due_days, default_sla_days")
        .maybeSingle();

      if (error) throw error;
      
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['trainer-activities', user.id] });
      
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to create activity";
      return { error: msg } as const;
    }
  };

  const updateActivity = async (id: string, name: string, category: string, description?: string | null) => {
    try {
      const { data, error } = await supabase
        .from("trainer_onboarding_activities")
        .update({ activity_name: name, category, description: description ?? null })
        .eq("id", id)
        .select("id, activity_name, category, is_system, description, guidance_html, default_due_days, default_sla_days")
        .maybeSingle();

      if (error) throw error;
      
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['trainer-activities', user?.id] });
      
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to update activity";
      return { error: msg } as const;
    }
  };

  const updateActivityDetails = async (
    id: string,
    details: {
      name: string;
      category: string;
      ways_of_working_category?: string | null;
      description?: string | null;
      guidance_html?: string | null;
      default_due_days?: number | null;
      default_sla_days?: number | null;
    }
  ) => {
    try {
      const { data, error } = await supabase
        .from("trainer_onboarding_activities")
        .update({
          activity_name: details.name,
          category: details.category,
          ways_of_working_category: details.ways_of_working_category ?? null,
          description: details.description ?? null,
          guidance_html: details.guidance_html ?? null,
          default_due_days: details.default_due_days ?? null,
          default_sla_days: details.default_sla_days ?? null,
        })
        .eq("id", id)
        .select("id, activity_name, category, ways_of_working_category, is_system, description, guidance_html, default_due_days, default_sla_days")
        .maybeSingle();

      if (error) throw error;
      
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['trainer-activities', user?.id] });
      
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to update activity details";
      return { error: msg } as const;
    }
  };

  const getSuggestionsBySection = (sectionKey: string): string[] => {
    const sectionToCategory = getSectionToCategory();
    const category = sectionToCategory[sectionKey];
    if (!category) return [];
    const names = activities
      .filter((a) => a.ways_of_working_category === category)
      .map((a) => a.activity_name.trim())
      .filter((t) => t.length > 0);
    return Array.from(new Set(names));
  };

  const getSuggestionsByProfileSection = (profileSectionKey: string): string[] => {
    console.log(`Getting suggestions for ${profileSectionKey}...`);
    console.log(`Activities count: ${activities.length}, Categories count: ${categories.length}`);
    
    // Get categories directly from ways_of_working_categories table for this profile section
    const relevantCategories = categories
      .filter(cat => cat.profile_section_key === profileSectionKey)
      .map(cat => cat.activity_category);
    
    console.log(`Relevant categories for ${profileSectionKey}:`, relevantCategories);

    // Get activities that have ways_of_working_category matching those categories
    const matchingActivities = activities
      .filter((a) => a.ways_of_working_category && relevantCategories.includes(a.ways_of_working_category));
    
    console.log(`Matching activities for ${profileSectionKey}:`, matchingActivities.map(a => a.activity_name));
    
    const names = matchingActivities
      .map((a) => a.activity_name.trim())
      .filter((t) => t.length > 0);
      
    console.log(`Final suggestions for ${profileSectionKey}:`, names);
    return Array.from(new Set(names));
  };

  return {
    activities,
    loading,
    error,
    refresh: () => refetch(),
    getSuggestionsBySection,
    getSuggestionsByProfileSection,
    createActivity,
    updateActivity,
    updateActivityDetails
  };
}