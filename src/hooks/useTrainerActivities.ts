import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWaysOfWorkingCategories } from "@/hooks/useWaysOfWorkingCategories";

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
  const [activities, setActivities] = useState<TrainerActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { getSectionToCategory, categories } = useWaysOfWorkingCategories();

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
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
      setActivities(data || []);
    } catch (e: any) {
      console.error("Failed to load activities:", e);
      setError(e.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities on mount and refresh when categories change
  useEffect(() => {
    fetchAll();
  }, []);

  // Refresh when categories data changes (for when database updates happen)
  useEffect(() => {
    if (categories.length > 0) {
      fetchAll();
    }
  }, [categories.length]);

  const createActivity = async (name: string, category: string, description?: string | null) => {
    if (!user?.id) {
      const msg = "You must be signed in to create activities";
      setError(msg);
      return { error: msg } as const;
    }
    setLoading(true);
    setError(null);
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
      await fetchAll();
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to create activity";
      setError(msg);
      return { error: msg } as const;
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = async (id: string, name: string, category: string, description?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("trainer_onboarding_activities")
        .update({ activity_name: name, category, description: description ?? null })
        .eq("id", id)
        .select("id, activity_name, category, is_system, description, guidance_html, default_due_days, default_sla_days")
        .maybeSingle();

      if (error) throw error;
      await fetchAll();
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to update activity";
      setError(msg);
      return { error: msg } as const;
    } finally {
      setLoading(false);
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
    setLoading(true);
    setError(null);
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
      await fetchAll();
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to update activity details";
      setError(msg);
      return { error: msg } as const;
    } finally {
      setLoading(false);
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
    console.log("🔍 getSuggestionsByProfileSection called with:", profileSectionKey);
    console.log("📊 Categories loaded:", categories.length, categories);
    console.log("🎯 Activities loaded:", activities.length, activities.filter(a => a.is_system).length, "system activities");
    
    // Get categories directly from ways_of_working_categories table for this profile section
    const relevantCategories = categories
      .filter(cat => cat.profile_section_key === profileSectionKey)
      .map(cat => cat.activity_category);
    
    console.log("🎯 Relevant categories for", profileSectionKey, ":", relevantCategories);

    // Log all system activities and their ways_of_working_category
    const systemActivities = activities.filter(a => a.is_system);
    console.log("🔧 System activities and their categories:", systemActivities.map(a => ({
      name: a.activity_name,
      ways_of_working_category: a.ways_of_working_category,
      category: a.category
    })));

    // Get activities that have ways_of_working_category matching those categories
    const matchingActivities = activities
      .filter((a) => {
        const hasCategory = a.ways_of_working_category && relevantCategories.includes(a.ways_of_working_category);
        if (a.is_system && profileSectionKey === 'how_i_work') {
          console.log(`🔍 Activity "${a.activity_name}": ways_of_working_category="${a.ways_of_working_category}", matches=${hasCategory}`);
        }
        return hasCategory;
      });
      
    console.log("✅ Matching activities:", matchingActivities.map(a => ({
      name: a.activity_name,
      category: a.ways_of_working_category,
      isSystem: a.is_system
    })));
    
    const names = matchingActivities
      .map((a) => a.activity_name.trim())
      .filter((t) => t.length > 0);
      
    console.log("📝 Final suggestions:", names);
    return Array.from(new Set(names));
  };

  return {
    activities,
    loading,
    error,
    refresh: fetchAll,
    getSuggestionsBySection,
    getSuggestionsByProfileSection,
    createActivity,
    updateActivity,
    updateActivityDetails
  };
}