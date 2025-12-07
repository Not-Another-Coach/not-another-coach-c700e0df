import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientMotivator {
  id: string;
  key: string;
  label: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Fetch only active motivators (for client survey)
export function useClientMotivators() {
  return useQuery({
    queryKey: ['client-motivators', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_motivators')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ClientMotivator[];
    }
  });
}

// Fetch all motivators (for admin)
export function useAllClientMotivators() {
  return useQuery({
    queryKey: ['client-motivators', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_motivators')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ClientMotivator[];
    }
  });
}

export function useClientMotivatorMutations() {
  const queryClient = useQueryClient();
  
  const createMotivator = useMutation({
    mutationFn: async (motivator: Omit<ClientMotivator, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('client_motivators')
        .insert(motivator)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-motivators'] });
    }
  });
  
  const updateMotivator = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClientMotivator> & { id: string }) => {
      const { data, error } = await supabase
        .from('client_motivators')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-motivators'] });
    }
  });
  
  const deleteMotivator = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_motivators')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-motivators'] });
    }
  });
  
  return { createMotivator, updateMotivator, deleteMotivator };
}
