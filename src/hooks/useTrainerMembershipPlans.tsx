import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MembershipPlanDefinition } from '@/services/admin/types';
import { toast } from 'sonner';

interface TrainerCurrentPlan extends MembershipPlanDefinition {
  membership_id: string;
  is_active: boolean;
  renewal_date: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

export const useTrainerMembershipPlans = (trainerId?: string) => {
  const [availablePlans, setAvailablePlans] = useState<MembershipPlanDefinition[]>([]);
  const [currentPlan, setCurrentPlan] = useState<TrainerCurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAvailablePlans = async () => {
    const { data, error } = await supabase
      .from('membership_plan_definitions' as any)
      .select('*')
      .eq('is_available_to_new_trainers', true)
      .order('monthly_price_cents', { ascending: false });
    
    if (error) {
      console.error('Error fetching available plans:', error);
      toast.error('Failed to load available plans');
      return;
    }
    
    setAvailablePlans((data || []) as unknown as MembershipPlanDefinition[]);
  };

  const fetchCurrentPlan = async (userId: string) => {
    try {
      // First get the trainer's membership
      const { data: membership, error: membershipError } = await supabase
        .from('trainer_membership' as any)
        .select('*')
        .eq('trainer_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (membershipError) {
        console.error('Error fetching membership:', membershipError);
        toast.error('Failed to load membership');
        return;
      }

      if (!membership) {
        setCurrentPlan(null);
        return;
      }

      // Then get the plan definition
      const { data: planDefinition, error: planError } = await supabase
        .from('membership_plan_definitions' as any)
        .select('*')
        .eq('id', (membership as any).plan_definition_id)
        .maybeSingle();

      if (planError) {
        console.error('Error fetching plan definition:', planError);
        toast.error('Failed to load plan definition');
        return;
      }

      if (!planDefinition) {
        console.warn(`No plan definition found for id: ${(membership as any).plan_definition_id}`);
        setCurrentPlan(null);
        return;
      }

      // Merge the data
      setCurrentPlan({
        membership_id: (membership as any).id,
        is_active: (membership as any).is_active,
        stripe_subscription_id: (membership as any).stripe_subscription_id,
        stripe_customer_id: (membership as any).stripe_customer_id,
        renewal_date: (membership as any).renewal_date,
        ...(planDefinition as any)
      } as TrainerCurrentPlan);
    } catch (error) {
      console.error('Error in fetchCurrentPlan:', error);
      toast.error('Failed to load membership information');
    }
  };

  const updateTrainerPlan = async (planDefinitionId: string) => {
    if (!trainerId) {
      toast.error('Trainer ID is required');
      return false;
    }

    try {
      // Update the trainer_membership table with the new plan_definition_id
      const { error } = await supabase
        .from('trainer_membership' as any)
        .update({
          plan_definition_id: planDefinitionId,
          updated_at: new Date().toISOString()
        })
        .eq('trainer_id', trainerId)
        .eq('is_active', true);

      if (error) throw error;

      toast.success('Membership plan updated successfully');
      await fetchCurrentPlan(trainerId);
      return true;
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update membership plan');
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAvailablePlans();
      
      if (trainerId) {
        await fetchCurrentPlan(trainerId);
      }
      
      setLoading(false);
    };

    loadData();
  }, [trainerId]);

  return {
    availablePlans,
    currentPlan,
    loading,
    updateTrainerPlan,
    refreshPlans: () => {
      if (trainerId) {
        fetchCurrentPlan(trainerId);
      }
      fetchAvailablePlans();
    }
  };
};
