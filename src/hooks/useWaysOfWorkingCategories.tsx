import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { queryConfig } from "@/lib/queryConfig";

export type WaysOfWorkingCategory = {
  id: string;
  section_key: string;
  section_name: string;
  activity_category: string;
  display_order: number;
  profile_section_key?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export function useWaysOfWorkingCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use React Query for caching and deduplication
  const { data: categories = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['ways-of-working-categories'],
    queryFn: async () => {
      console.log('useWaysOfWorkingCategories: Fetching categories');
      
      const { data, error } = await supabase
        .from("ways_of_working_categories")
        .select("*")
        .order("section_key", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Failed to load categories:", error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 min - categories rarely change
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const error = queryError ? (queryError as Error).message : null;

  const createCategory = async (
    sectionKey: string, 
    sectionName: string, 
    activityCategory: string, 
    displayOrder: number,
    profileSectionKey?: string
  ) => {
    if (!user?.id) {
      const msg = "You must be signed in to create categories";
      return { error: msg } as const;
    }

    try {
      const { data, error } = await supabase
        .from("ways_of_working_categories")
        .insert({
          section_key: sectionKey,
          section_name: sectionName,
          activity_category: activityCategory,
          display_order: displayOrder,
          profile_section_key: profileSectionKey,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['ways-of-working-categories'] });
      
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to create category";
      return { error: msg } as const;
    }
  };

  const updateCategory = async (
    id: string,
    sectionKey: string,
    sectionName: string,
    activityCategory: string,
    displayOrder: number,
    profileSectionKey?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("ways_of_working_categories")
        .update({
          section_key: sectionKey,
          section_name: sectionName,
          activity_category: activityCategory,
          display_order: displayOrder,
          profile_section_key: profileSectionKey,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['ways-of-working-categories'] });
      
      return { data } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to update category";
      return { error: msg } as const;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ways_of_working_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['ways-of-working-categories'] });
      
      return { success: true } as const;
    } catch (e: any) {
      const msg = e.message || "Failed to delete category";
      return { error: msg } as const;
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
    refresh: () => refetch(),
    createCategory,
    updateCategory,
    deleteCategory,
    getSectionToCategory,
    getCategoryToSection,
  };
}