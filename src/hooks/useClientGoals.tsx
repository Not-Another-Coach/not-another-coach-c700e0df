import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientGoal {
  id: string;
  goal_key: string;
  label: string;
  description: string | null;
  icon: string;
  goal_type: 'primary' | 'secondary';
  is_active: boolean;
  display_order: number;
  visibility_rules: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateClientGoalRequest {
  goal_key: string;
  label: string;
  description?: string | null;
  icon?: string;
  goal_type: 'primary' | 'secondary';
  display_order?: number;
  visibility_rules?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateClientGoalRequest {
  goal_key?: string;
  label?: string;
  description?: string | null;
  icon?: string;
  goal_type?: 'primary' | 'secondary';
  display_order?: number;
  visibility_rules?: Record<string, any>;
  is_active?: boolean;
}

export function useClientGoals() {
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_goals')
        .select('*')
        .order('goal_type')
        .order('display_order');

      if (error) throw error;
      setGoals((data as ClientGoal[]) || []);
    } catch (error) {
      console.error('Error fetching client goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load client goals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: CreateClientGoalRequest) => {
    try {
      const { error } = await supabase
        .from('client_goals')
        .insert(goalData);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Goal created successfully',
      });
      
      await fetchGoals();
      return true;
    } catch (error: any) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create goal',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateGoal = async (id: string, updates: UpdateClientGoalRequest) => {
    try {
      const { error } = await supabase
        .from('client_goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Goal updated successfully',
      });
      
      await fetchGoals();
      return true;
    } catch (error: any) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update goal',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('client_goals')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Goal deactivated successfully',
      });
      
      await fetchGoals();
      return true;
    } catch (error: any) {
      console.error('Error deactivating goal:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate goal',
        variant: 'destructive',
      });
      return false;
    }
  };

  const reorderGoals = async (goalIds: string[]) => {
    try {
      const updates = goalIds.map((id, index) => ({
        id,
        display_order: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('client_goals')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Goals reordered successfully',
      });
      
      await fetchGoals();
      return true;
    } catch (error: any) {
      console.error('Error reordering goals:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reorder goals',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    refetch: fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    reorderGoals,
    primaryGoals: goals.filter(g => g.goal_type === 'primary'),
    secondaryGoals: goals.filter(g => g.goal_type === 'secondary'),
  };
}

// Hook for client survey - only fetches active goals
export function useActiveClientGoals() {
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveGoals = async () => {
      try {
        const { data, error } = await supabase
          .from('client_goals')
          .select('*')
          .eq('is_active', true)
          .order('goal_type')
          .order('display_order');

        if (error) throw error;
        setGoals((data as ClientGoal[]) || []);
      } catch (error) {
        console.error('Error fetching active client goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveGoals();
  }, []);

  return {
    goals,
    loading,
    primaryGoals: goals.filter(g => g.goal_type === 'primary'),
    secondaryGoals: goals.filter(g => g.goal_type === 'secondary'),
  };
}
