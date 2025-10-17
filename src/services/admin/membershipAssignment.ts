import { supabase } from '@/integrations/supabase/client';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import type { ServiceResponse } from '../types';

export interface TrainerMembershipInfo {
  trainer_id: string;
  trainer_email: string;
  trainer_name: string;
  current_plan_id?: string;
  current_plan_name?: string;
  current_plan_type?: string;
  monthly_price_cents?: number;
  is_active?: boolean;
  renewal_date?: string;
  payment_status?: string;
  grace_end_date?: string;
}

export interface BulkAssignmentResult {
  trainer_id: string;
  membership_id: string;
  trainer_email: string;
}

export class MembershipAssignmentService {
  /**
   * Get all trainers with their current membership status
   */
  static async getTrainersWithMemberships(): Promise<ServiceResponse<TrainerMembershipInfo[]>> {
    try {
      // 1) Get trainer profiles (no joins)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('user_type', 'trainer')
        .order('first_name');

      if (profilesError) {
        console.error('Profile fetch error:', profilesError);
        throw profilesError;
      }

      const trainerIds = (profilesData || []).map((p: any) => p.id);

      // 2) Get memberships for these trainers separately
      const membershipsByTrainer = new Map<string, any>();
      if (trainerIds.length > 0) {
        const { data: memberships, error: membershipError } = await supabase
          .from('trainer_membership')
          .select('trainer_id, plan_type, monthly_price_cents, is_active, renewal_date, payment_status, grace_end_date')
          .in('trainer_id', trainerIds);

        if (membershipError) {
          console.error('Membership fetch error (non-fatal):', membershipError);
        } else {
          (memberships || []).forEach((m: any) => {
            // prefer active membership
            const existing = membershipsByTrainer.get(m.trainer_id);
            if (!existing || (m.is_active && !existing.is_active)) {
              membershipsByTrainer.set(m.trainer_id, m);
            }
          });
        }
      }

      // 3) Fetch active plan definitions to map plan_type -> human plan_name
      const { data: planDefs, error: defsError } = await supabase
        .from('membership_plan_definitions')
        .select('plan_type, plan_name, is_active');

      if (defsError) {
        console.error('Plan definitions fetch error:', defsError);
        throw defsError;
      }

      const planNameByType = new Map<string, string>(
        (planDefs || [])
          .filter((p: any) => p.is_active !== false)
          .map((p: any) => [p.plan_type, p.plan_name])
      );

      // 4) Get emails from edge function (continue even if it fails or different shape)
      const { data: emailsData, error: emailsError } = await supabase.functions.invoke('get-user-emails');
      if (emailsError) {
        console.error('Email fetch error (non-critical):', emailsError);
      }

      const emailMap = new Map<string, string>();
      const usersArray = Array.isArray((emailsData as any)?.users)
        ? (emailsData as any).users
        : Array.isArray(emailsData)
        ? (emailsData as any)
        : [];
      usersArray.forEach((user: any) => {
        if (user?.id && user?.email) emailMap.set(user.id, user.email);
      });

      // 5) Compose final trainers list
      const trainers: TrainerMembershipInfo[] = (profilesData || []).map((trainer: any) => {
        const activeMembership = membershipsByTrainer.get(trainer.id);
        const planType = activeMembership?.plan_type as string | undefined;

        return {
          trainer_id: trainer.id,
          trainer_email: emailMap.get(trainer.id) || 'No email',
          trainer_name: `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Unnamed',
          current_plan_id: undefined,
          current_plan_name: planType ? planNameByType.get(planType) || planType : undefined,
          current_plan_type: planType,
          monthly_price_cents: activeMembership?.monthly_price_cents,
          is_active: activeMembership?.is_active,
          renewal_date: activeMembership?.renewal_date,
          payment_status: activeMembership?.payment_status,
          grace_end_date: activeMembership?.grace_end_date,
        };
      });

      return ServiceResponseHelper.success(trainers);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Assign a membership plan to a trainer
   */
  static async assignPlan(
    trainerId: string,
    planDefinitionId: string,
    notes?: string
  ): Promise<ServiceResponse<string>> {
    try {
      const { data, error } = await supabase.rpc('admin_assign_trainer_membership_plan' as any, {
        p_trainer_id: trainerId,
        p_plan_definition_id: planDefinitionId,
        p_notes: notes || null,
      } as any);

      if (error) throw error;

      return ServiceResponseHelper.success(data as string);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Bulk assign default plan to all trainers without memberships
   */
  static async bulkAssignDefault(): Promise<ServiceResponse<BulkAssignmentResult[]>> {
    try {
      const { data, error } = await supabase.rpc('admin_bulk_assign_default_membership' as any);

      if (error) throw error;

      return ServiceResponseHelper.success((data || []) as BulkAssignmentResult[]);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }
}
