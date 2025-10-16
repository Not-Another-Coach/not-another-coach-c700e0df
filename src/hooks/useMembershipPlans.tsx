import { useState, useEffect } from 'react';
import { AdminService } from '@/services/admin';
import { MembershipPlanDefinition, CreateMembershipPlanRequest, UpdateMembershipPlanRequest } from '@/services/admin/types';
import { toast } from 'sonner';

export const useMembershipPlans = () => {
  const [plans, setPlans] = useState<MembershipPlanDefinition[]>([]);
  const [planStats, setPlanStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    const [plansResponse, statsResponse] = await Promise.all([
      AdminService.getMembershipPlans(),
      AdminService.getMembershipPlanStats()
    ]);

    if (plansResponse.success && plansResponse.data) {
      setPlans(plansResponse.data);
    } else {
      toast.error('Failed to load membership plans');
    }

    if (statsResponse.success && statsResponse.data) {
      setPlanStats(statsResponse.data);
    }

    setLoading(false);
  };

  const createPlan = async (request: CreateMembershipPlanRequest) => {
    const response = await AdminService.createMembershipPlan(request);
    
    if (response.success) {
      toast.success('Membership plan created successfully');
      await fetchPlans();
      return true;
    } else {
      toast.error(response.error?.message || 'Failed to create membership plan');
      return false;
    }
  };

  const updatePlan = async (request: UpdateMembershipPlanRequest) => {
    const response = await AdminService.updateMembershipPlan(request);
    
    if (response.success) {
      toast.success('Membership plan updated successfully');
      await fetchPlans();
      return true;
    } else {
      toast.error(response.error?.message || 'Failed to update membership plan');
      return false;
    }
  };

  const archivePlan = async (planId: string) => {
    const response = await AdminService.archiveMembershipPlan(planId);
    
    if (response.success) {
      toast.success('Membership plan archived successfully');
      await fetchPlans();
      return true;
    } else {
      toast.error(response.error?.message || 'Failed to archive membership plan');
      return false;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    planStats,
    loading,
    createPlan,
    updatePlan,
    archivePlan,
    refreshPlans: fetchPlans
  };
};
