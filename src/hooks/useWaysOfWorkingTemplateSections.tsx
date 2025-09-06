import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type WaysOfWorkingTemplateSection = {
  id: string;
  section_key: string;
  section_name: string;
  profile_section_key: string;
  display_order: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export function useWaysOfWorkingTemplateSections() {
  const [sections, setSections] = useState<WaysOfWorkingTemplateSection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const PROFILE_SECTIONS = [
    { key: 'how_i_work', name: 'How I Work' },
    { key: 'what_i_provide', name: 'What I Provide' },
    { key: 'client_expectations', name: 'Client Expectations' }
  ];

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("ways_of_working_template_sections")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (e: any) {
      console.error("Failed to load template sections:", e);
      setError(e.message || "Failed to load template sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const createSection = async (
    sectionKey: string,
    sectionName: string,
    profileSectionKey: string,
    displayOrder: number
  ) => {
    if (!user?.id) {
      const msg = "You must be signed in to create template sections";
      setError(msg);
      return { error: msg } as const;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("ways_of_working_template_sections")
        .insert({
          section_key: sectionKey,
          section_name: sectionName,
          profile_section_key: profileSectionKey,
          display_order: displayOrder,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchSections();
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to create template section";
      setError(msg);
      return { error: msg } as const;
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (
    id: string,
    sectionKey: string,
    sectionName: string,
    profileSectionKey: string,
    displayOrder: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("ways_of_working_template_sections")
        .update({
          section_key: sectionKey,
          section_name: sectionName,
          profile_section_key: profileSectionKey,
          display_order: displayOrder,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await fetchSections();
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to update template section";
      setError(msg);
      return { error: msg } as const;
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("ways_of_working_template_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchSections();
      return { success: true } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to delete template section";
      setError(msg);
      return { error: msg } as const;
    } finally {
      setLoading(false);
    }
  };

  const getProfileSections = () => PROFILE_SECTIONS;

  return {
    sections,
    loading,
    error,
    refresh: fetchSections,
    createSection,
    updateSection,
    deleteSection,
    getProfileSections,
  };
}