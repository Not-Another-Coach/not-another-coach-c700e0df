import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MotivatorActivityMapping {
  id: string;
  motivator_id: string;
  activity_id: string;
  weight: number;
  created_at: string;
  // Joined data
  activity?: {
    id: string;
    activity_name: string;
    category: string;
  };
}

export interface SystemActivity {
  id: string;
  activity_name: string;
  category: string;
  description: string | null;
  is_active: boolean;
}

// Fetch all mappings with activity details
export function useMotivatorActivityMappings() {
  return useQuery({
    queryKey: ['motivator-activity-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('motivator_activity_mappings')
        .select(`
          *,
          activity:trainer_onboarding_activities (
            id,
            activity_name,
            category
          )
        `)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as MotivatorActivityMapping[];
    }
  });
}

// Fetch system activities for mapping selection
export function useSystemActivities() {
  return useQuery({
    queryKey: ['system-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_onboarding_activities')
        .select('id, activity_name, category, description, is_active')
        .eq('is_system', true)
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('activity_name', { ascending: true });
      
      if (error) throw error;
      return data as SystemActivity[];
    }
  });
}

// Get mappings grouped by motivator for matching algorithm
export function useMotivatorActivityMappingsForMatching() {
  return useQuery({
    queryKey: ['motivator-activity-mappings', 'for-matching'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('motivator_activity_mappings')
        .select(`
          motivator_id,
          activity_id,
          weight,
          motivator:client_motivators!motivator_id (
            key
          )
        `);
      
      if (error) throw error;
      
      // Transform into a lookup by motivator key
      const lookup = new Map<string, string[]>();
      data?.forEach((mapping: any) => {
        const motivatorKey = mapping.motivator?.key;
        if (motivatorKey) {
          if (!lookup.has(motivatorKey)) {
            lookup.set(motivatorKey, []);
          }
          lookup.get(motivatorKey)!.push(mapping.activity_id);
        }
      });
      
      return lookup;
    }
  });
}

export function useMotivatorActivityMappingMutations() {
  const queryClient = useQueryClient();
  
  const createMapping = useMutation({
    mutationFn: async (mapping: { motivator_id: string; activity_id: string; weight?: number }) => {
      const { data, error } = await supabase
        .from('motivator_activity_mappings')
        .insert({
          motivator_id: mapping.motivator_id,
          activity_id: mapping.activity_id,
          weight: mapping.weight ?? 100
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motivator-activity-mappings'] });
    }
  });
  
  const deleteMapping = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('motivator_activity_mappings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motivator-activity-mappings'] });
    }
  });
  
  // Bulk update mappings for a motivator
  const setMappingsForMotivator = useMutation({
    mutationFn: async ({ motivatorId, activityIds }: { motivatorId: string; activityIds: string[] }) => {
      // Delete existing mappings for this motivator
      const { error: deleteError } = await supabase
        .from('motivator_activity_mappings')
        .delete()
        .eq('motivator_id', motivatorId);
      
      if (deleteError) throw deleteError;
      
      // Insert new mappings
      if (activityIds.length > 0) {
        const { error: insertError } = await supabase
          .from('motivator_activity_mappings')
          .insert(activityIds.map(activityId => ({
            motivator_id: motivatorId,
            activity_id: activityId,
            weight: 100
          })));
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motivator-activity-mappings'] });
    }
  });
  
  return { createMapping, deleteMapping, setMappingsForMotivator };
}
