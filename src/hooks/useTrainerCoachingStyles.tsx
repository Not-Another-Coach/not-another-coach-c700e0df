import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrainerCoachingStyle {
  id: string;
  style_key: string;
  label: string;
  description: string | null;
  emoji: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTrainerCoachingStyles() {
  return useQuery({
    queryKey: ['trainer-coaching-styles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_coaching_styles')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TrainerCoachingStyle[];
    }
  });
}

export function useAllTrainerCoachingStyles() {
  return useQuery({
    queryKey: ['trainer-coaching-styles', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_coaching_styles')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TrainerCoachingStyle[];
    }
  });
}

export function useTrainerCoachingStyleMutations() {
  const queryClient = useQueryClient();
  
  const createStyle = useMutation({
    mutationFn: async (style: Omit<TrainerCoachingStyle, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('trainer_coaching_styles')
        .insert(style)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-coaching-styles'] });
    }
  });
  
  const updateStyle = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TrainerCoachingStyle> & { id: string }) => {
      const { data, error } = await supabase
        .from('trainer_coaching_styles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-coaching-styles'] });
    }
  });
  
  const deleteStyle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trainer_coaching_styles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-coaching-styles'] });
    }
  });
  
  return { createStyle, updateStyle, deleteStyle };
}
