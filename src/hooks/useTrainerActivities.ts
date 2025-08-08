import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TrainerActivity = {
  activity_name: string;
  category: string;
  is_system: boolean;
};

const SECTION_TO_CATEGORY: Record<string, string> = {
  onboarding: "Onboarding",
  first_week: "First Week",
  ongoing_structure: "Ongoing Structure",
  tracking_tools: "Tracking Tools",
  client_expectations: "Client Expectations",
  what_i_bring: "What I Bring",
};

export function useTrainerActivities() {
  const [activities, setActivities] = useState<TrainerActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // RLS ensures we get: system activities + current trainer's activities
      const { data, error } = await supabase
        .from("trainer_onboarding_activities")
        .select("activity_name, category, is_system")
        .order("activity_name");

      if (error) throw error;
      setActivities(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getSuggestionsBySection = (sectionKey: string): string[] => {
    const category = SECTION_TO_CATEGORY[sectionKey];
    if (!category) return [];
    const names = activities
      .filter((a) => a.category === category)
      .map((a) => a.activity_name.trim())
      .filter((t) => t.length > 0);
    // Deduplicate while preserving order
    return Array.from(new Set(names));
  };

  return {
    loading,
    error,
    refresh: fetchAll,
    getSuggestionsBySection,
  };
}
