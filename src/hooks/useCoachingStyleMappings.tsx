import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CoachingStyleMapping {
  id: string;
  client_style_id: string;
  trainer_style_id: string;
  weight: number;
  mapping_type: 'primary' | 'secondary' | 'tertiary';
  created_at: string;
  client_style?: {
    id: string;
    style_key: string;
    label: string;
  };
  trainer_style?: {
    id: string;
    style_key: string;
    label: string;
  };
}

export function useCoachingStyleMappings() {
  return useQuery({
    queryKey: ['coaching-style-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coaching_style_mappings')
        .select(`
          *,
          client_style:client_coaching_styles(id, style_key, label),
          trainer_style:trainer_coaching_styles(id, style_key, label)
        `)
        .order('weight', { ascending: false });
      
      if (error) throw error;
      return data as CoachingStyleMapping[];
    }
  });
}

// Lookup for matching algorithm: client_style_key -> [{ trainer_style_key, weight }]
export interface CoachingStyleMappingLookup {
  [clientStyleKey: string]: Array<{
    trainerStyleKey: string;
    weight: number;
    mappingType: string;
  }>;
}

export function useCoachingStyleMappingsForMatching() {
  return useQuery({
    queryKey: ['coaching-style-mappings', 'for-matching'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coaching_style_mappings')
        .select(`
          weight,
          mapping_type,
          client_style:client_coaching_styles(style_key),
          trainer_style:trainer_coaching_styles(style_key)
        `);
      
      if (error) throw error;
      
      // Build lookup by client style key
      const lookup: CoachingStyleMappingLookup = {};
      
      data?.forEach((mapping: any) => {
        const clientKey = mapping.client_style?.style_key;
        const trainerKey = mapping.trainer_style?.style_key;
        
        if (clientKey && trainerKey) {
          if (!lookup[clientKey]) {
            lookup[clientKey] = [];
          }
          lookup[clientKey].push({
            trainerStyleKey: trainerKey,
            weight: mapping.weight,
            mappingType: mapping.mapping_type
          });
        }
      });
      
      return lookup;
    }
  });
}

export function useCoachingStyleMappingMutations() {
  const queryClient = useQueryClient();
  
  const createMapping = useMutation({
    mutationFn: async (mapping: Omit<CoachingStyleMapping, 'id' | 'created_at' | 'client_style' | 'trainer_style'>) => {
      const { data, error } = await supabase
        .from('coaching_style_mappings')
        .insert(mapping)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-style-mappings'] });
    }
  });
  
  const updateMapping = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CoachingStyleMapping> & { id: string }) => {
      const { data, error } = await supabase
        .from('coaching_style_mappings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-style-mappings'] });
    }
  });
  
  const deleteMapping = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coaching_style_mappings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-style-mappings'] });
    }
  });
  
  return { createMapping, updateMapping, deleteMapping };
}
