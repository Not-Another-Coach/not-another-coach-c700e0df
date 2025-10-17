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
    // Get trainer's active membership (schema stores plan_type, not plan_definition_id)
    const { data: membership, error: membershipError } = await supabase
      .from('trainer_membership' as any)
      .select('id, trainer_id, plan_type, monthly_price_cents, is_active, renewal_date')
      .eq('trainer_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (membershipError) {
      console.error('Error fetching trainer_membership:', membershipError);
      setCurrentPlan(null);
      return;
    }

    if (!membership) {
      setCurrentPlan(null);
      return;
    }

    // Fetch plan definition by plan_type and merge details
    const { data: planDef, error: defError } = await supabase
      .from('membership_plan_definitions' as any)
      .select('*')
      .eq('plan_type', (membership as any).plan_type)
      .maybeSingle();

    if (defError) {
      console.error('Error fetching plan definition:', defError);
    }

    if (planDef) {
      setCurrentPlan({
        ...(planDef as any),
        // Ensure price present (prefer planDef, fallback to membership)
        monthly_price_cents: (planDef as any).monthly_price_cents ?? (membership as any).monthly_price_cents ?? 0,
        membership_id: (membership as any).id,
        is_active: (membership as any).is_active,
        renewal_date: (membership as any).renewal_date,
        stripe_subscription_id: null,
        stripe_customer_id: null
      } as TrainerCurrentPlan);
    } else {
      // Fallback minimal plan using membership info
      const planType = (membership as any).plan_type as 'high' | 'low';
      setCurrentPlan({
        id: `synthetic-${planType}`,
        plan_name: planType,
        plan_type: planType,
        display_name: planType === 'high' ? 'High Plan' : 'Low Plan',
        monthly_price_cents: (membership as any).monthly_price_cents ?? 0,
        has_package_commission: false,
        is_available_to_new_trainers: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        membership_id: (membership as any).id,
        is_active: (membership as any).is_active,
        renewal_date: (membership as any).renewal_date,
        stripe_subscription_id: null,
        stripe_customer_id: null
      } as TrainerCurrentPlan);
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
