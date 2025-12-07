import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientCoachingStyle {
  id: string;
  style_key: string;
  label: string;
  description: string | null;
  icon: string | null;
  keywords: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useClientCoachingStyles() {
  return useQuery({
    queryKey: ['client-coaching-styles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_coaching_styles')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ClientCoachingStyle[];
    }
  });
}

export function useAllClientCoachingStyles() {
  return useQuery({
    queryKey: ['client-coaching-styles', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_coaching_styles')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ClientCoachingStyle[];
    }
  });
}

export function useClientCoachingStyleMutations() {
  const queryClient = useQueryClient();
  
  const createStyle = useMutation({
    mutationFn: async (style: Omit<ClientCoachingStyle, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('client_coaching_styles')
        .insert(style)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-coaching-styles'] });
    }
  });
  
  const updateStyle = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClientCoachingStyle> & { id: string }) => {
      const { data, error } = await supabase
        .from('client_coaching_styles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-coaching-styles'] });
    }
  });
  
  const deleteStyle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_coaching_styles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-coaching-styles'] });
    }
  });
  
  return { createStyle, updateStyle, deleteStyle };
}
