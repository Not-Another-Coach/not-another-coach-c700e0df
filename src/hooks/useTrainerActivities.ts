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
  const { getSectionToCategory } = useWaysOfWorkingCategories();

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

  // Fetch activities on mount
  useEffect(() => {
    fetchAll();
  }, []);

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

  const getSuggestionsByProfileSection = (profileSectionKey: string, templateSections: any[]): string[] => {
    // Get all template sections that map to this profile section
    const relevantTemplateSections = templateSections.filter(
      ts => ts.profile_section_key === profileSectionKey
    );
    
    // Get activity categories directly from template sections (not via section mapping)
    const relevantCategories: string[] = [];
    
    relevantTemplateSections.forEach(ts => {
      if (ts.activity_category) {
        relevantCategories.push(ts.activity_category);
      }
    });

    // Get activities that have ways_of_working_category matching those categories
    const names = activities
      .filter((a) => a.ways_of_working_category && relevantCategories.includes(a.ways_of_working_category))
      .map((a) => a.activity_name.trim())
      .filter((t) => t.length > 0);
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