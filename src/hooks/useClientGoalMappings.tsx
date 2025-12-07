import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GoalSpecialtyMapping {
  id: string;
  goal_id: string;
  specialty_id: string;
  mapping_type: 'primary' | 'secondary' | 'optional';
  weight: number;
  created_at: string;
  specialty?: {
    id: string;
    name: string;
    category_id: string | null;
  };
}

export interface CreateMappingRequest {
  goal_id: string;
  specialty_id: string;
  mapping_type: 'primary' | 'secondary' | 'optional';
  weight?: number;
}

export interface UpdateMappingRequest {
  mapping_type?: 'primary' | 'secondary' | 'optional';
  weight?: number;
}

// Default weights based on mapping type
export const DEFAULT_WEIGHTS: Record<string, number> = {
  primary: 100,
  secondary: 60,
  optional: 30,
};

export function useGoalMappings(goalId?: string) {
  const [mappings, setMappings] = useState<GoalSpecialtyMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMappings = async () => {
    if (!goalId) {
      setMappings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_goal_specialty_mappings')
        .select(`
          *,
          specialty:specialties(id, name, category_id)
        `)
        .eq('goal_id', goalId)
        .order('weight', { ascending: false });

      if (error) throw error;
      setMappings((data as GoalSpecialtyMapping[]) || []);
    } catch (error) {
      console.error('Error fetching goal mappings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goal mappings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createMapping = async (mappingData: CreateMappingRequest) => {
    try {
      const dataToInsert = {
        ...mappingData,
        weight: mappingData.weight ?? DEFAULT_WEIGHTS[mappingData.mapping_type],
      };

      const { error } = await supabase
        .from('client_goal_specialty_mappings')
        .insert(dataToInsert);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Mapping added successfully',
      });
      
      await fetchMappings();
      return true;
    } catch (error: any) {
      console.error('Error creating mapping:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add mapping',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateMapping = async (id: string, updates: UpdateMappingRequest) => {
    try {
      const { error } = await supabase
        .from('client_goal_specialty_mappings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Mapping updated successfully',
      });
      
      await fetchMappings();
      return true;
    } catch (error: any) {
      console.error('Error updating mapping:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update mapping',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteMapping = async (id: string) => {
    try {
      const { error } = await supabase
        .from('client_goal_specialty_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Mapping removed successfully',
      });
      
      await fetchMappings();
      return true;
    } catch (error: any) {
      console.error('Error deleting mapping:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove mapping',
        variant: 'destructive',
      });
      return false;
    }
  };

  const bulkCreateMappings = async (mappings: CreateMappingRequest[]) => {
    try {
      const dataToInsert = mappings.map(m => ({
        ...m,
        weight: m.weight ?? DEFAULT_WEIGHTS[m.mapping_type],
      }));

      const { error } = await supabase
        .from('client_goal_specialty_mappings')
        .insert(dataToInsert);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `${mappings.length} mappings added successfully`,
      });
      
      await fetchMappings();
      return true;
    } catch (error: any) {
      console.error('Error creating mappings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add mappings',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [goalId]);

  return {
    mappings,
    loading,
    refetch: fetchMappings,
    createMapping,
    updateMapping,
    deleteMapping,
    bulkCreateMappings,
  };
}

// Hook to get all mappings for matching algorithm
export function useAllGoalMappings() {
  const [mappings, setMappings] = useState<GoalSpecialtyMapping[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllMappings = async () => {
      try {
        const { data, error } = await supabase
          .from('client_goal_specialty_mappings')
          .select(`
            *,
            specialty:specialties(id, name, category_id)
          `)
          .order('goal_id')
          .order('weight', { ascending: false });

        if (error) throw error;
        setMappings((data as GoalSpecialtyMapping[]) || []);
      } catch (error) {
        console.error('Error fetching all goal mappings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMappings();
  }, []);

  // Group mappings by goal_id for easy lookup
  const mappingsByGoalId = mappings.reduce((acc, mapping) => {
    if (!acc[mapping.goal_id]) {
      acc[mapping.goal_id] = [];
    }
    acc[mapping.goal_id].push(mapping);
    return acc;
  }, {} as Record<string, GoalSpecialtyMapping[]>);

  return {
    mappings,
    mappingsByGoalId,
    loading,
  };
}
