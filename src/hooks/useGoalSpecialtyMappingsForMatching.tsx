import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GoalSpecialtyMapping {
  specialty: string;
  weight: number;
  mappingType: 'primary' | 'secondary' | 'optional';
}

export type GoalMappingsLookup = Record<string, GoalSpecialtyMapping[]>;

export function useGoalSpecialtyMappingsForMatching() {
  return useQuery({
    queryKey: ['goal-specialty-mappings-for-matching'],
    queryFn: async (): Promise<GoalMappingsLookup> => {
      const { data, error } = await supabase
        .from('client_goal_specialty_mappings')
        .select(`
          weight,
          mapping_type,
          goal:client_goals!inner(goal_key, is_active),
          specialty:specialties!inner(name)
        `)
        .eq('goal.is_active', true);

      if (error) {
        console.error('Error fetching goal-specialty mappings:', error);
        throw error;
      }

      // Transform into lookup structure: { goal_key: [{ specialty, weight, mappingType }] }
      const lookup: GoalMappingsLookup = {};
      
      for (const row of data || []) {
        const goalKey = (row.goal as any)?.goal_key;
        const specialtyName = (row.specialty as any)?.name;
        
        if (!goalKey || !specialtyName) continue;
        
        if (!lookup[goalKey]) {
          lookup[goalKey] = [];
        }
        
        lookup[goalKey].push({
          specialty: specialtyName,
          weight: row.weight,
          mappingType: row.mapping_type as 'primary' | 'secondary' | 'optional'
        });
      }
      
      return lookup;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
