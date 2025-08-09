import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type TrainerActivity = {
  id: string;
  activity_name: string;
  category: string;
  is_system: boolean;
  description?: string | null;
  guidance_html?: string | null;
  default_due_days?: number | null;
  default_sla_days?: number | null;
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
  const { user } = useAuth();

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // RLS ensures we get: system activities + current trainer's activities
      const { data, error } = await supabase
        .from("trainer_onboarding_activities")
        .select("id, activity_name, category, is_system, description, guidance_html, default_due_days, default_sla_days")
        .order("activity_name");

      if (error) throw error;
      setActivities(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

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

useEffect(() => {
  fetchAll();
}, []);

const updateActivityDetails = async (
  id: string,
  details: {
    name: string;
    category: string;
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
        description: details.description ?? null,
        guidance_html: details.guidance_html ?? null,
        default_due_days: details.default_due_days ?? null,
        default_sla_days: details.default_sla_days ?? null,
      })
      .eq("id", id)
      .select("id, activity_name, category, is_system, description, guidance_html, default_due_days, default_sla_days")
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

  return {
    loading,
    error,
    refresh: fetchAll,
    getSuggestionsBySection,
    activities,
    createActivity,
    updateActivity,
    updateActivityDetails,
  };
}
