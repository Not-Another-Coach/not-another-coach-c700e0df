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
      .from('membership_plan_definitions')
      .select('*')
      .or('is_available_to_new_trainers.eq.true')
      .order('monthly_price_cents', { ascending: false });
    
    if (error) {
      console.error('Error fetching available plans:', error);
      toast.error('Failed to load available plans');
      return;
    }
    
    setAvailablePlans((data || []) as MembershipPlanDefinition[]);
  };

  const fetchCurrentPlan = async (userId: string) => {
    // Get trainer's current membership with plan details
    const { data: membershipData, error: membershipError } = await supabase
      .from('trainer_membership')
      .select(`
        id,
        plan_definition_id,
        is_active,
        renewal_date,
        stripe_subscription_id,
        stripe_customer_id,
        membership_plan_definitions (*)
      `)
      .eq('trainer_id', userId)
      .eq('is_active', true)
      .single();
    
    if (membershipError) {
      console.error('Error fetching current plan:', membershipError);
      return;
    }
    
    if (membershipData && membershipData.membership_plan_definitions) {
      const planDef = membershipData.membership_plan_definitions as any;
      setCurrentPlan({
        ...planDef,
        membership_id: membershipData.id,
        is_active: membershipData.is_active,
        renewal_date: membershipData.renewal_date,
        stripe_subscription_id: membershipData.stripe_subscription_id,
        stripe_customer_id: membershipData.stripe_customer_id
      });
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
        .from('trainer_membership')
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
