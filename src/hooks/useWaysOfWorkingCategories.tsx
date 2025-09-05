import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type WaysOfWorkingCategory = {
  id: string;
  section_key: string;
  section_name: string;
  activity_category: string;
  display_order: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export function useWaysOfWorkingCategories() {
  const [categories, setCategories] = useState<WaysOfWorkingCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("ways_of_working_categories")
        .select("*")
        .order("section_key", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (e: any) {
      console.error("Failed to load categories:", e);
      setError(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async (
    sectionKey: string, 
    sectionName: string, 
    activityCategory: string, 
    displayOrder: number
  ) => {
    if (!user?.id) {
      const msg = "You must be signed in to create categories";
      setError(msg);
      return { error: msg } as const;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("ways_of_working_categories")
        .insert({
          section_key: sectionKey,
          section_name: sectionName,
          activity_category: activityCategory,
          display_order: displayOrder,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchCategories();
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to create category";
      setError(msg);
      return { error: msg } as const;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (
    id: string,
    sectionKey: string,
    sectionName: string,
    activityCategory: string,
    displayOrder: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("ways_of_working_categories")
        .update({
          section_key: sectionKey,
          section_name: sectionName,
          activity_category: activityCategory,
          display_order: displayOrder,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await fetchCategories();
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to update category";
      setError(msg);
      return { error: msg } as const;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("ways_of_working_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchCategories();
      return { success: true } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to delete category";
      setError(msg);
      return { error: msg } as const;
    } finally {
      setLoading(false);
    }
  };

  const getSectionToCategory = () => {
    const mapping: Record<string, string> = {};
    categories.forEach(category => {
      mapping[category.section_key] = category.activity_category;
    });
    return mapping;
  };

  const getCategoryToSection = () => {
    const mapping: Record<string, string> = {};
    categories.forEach(category => {
      mapping[category.activity_category] = category.section_key;
    });
    return mapping;
  };

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getSectionToCategory,
    getCategoryToSection,
  };
}