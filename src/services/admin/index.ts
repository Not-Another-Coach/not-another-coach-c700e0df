/**
 * Admin Service
 * 
 * Handles administrative operations including user management,
 * data cleanup, and system configuration
 */

import { supabase } from '@/integrations/supabase/client';
import { BaseService } from '../base/BaseService';
import { ServiceResponse } from '../types';
import type {
  AdminAction,
  CleanupResult,
  UpdateEmailRequest,
  UpdateVerificationRequest
} from './types';

class AdminServiceClass extends BaseService {
  /**
   * Get admin action logs
   */
  async getAdminActions(limit: number = 50): Promise<ServiceResponse<AdminAction[]>> {
    return BaseService.executeListQuery(async () => {
      return await supabase
        .from('admin_actions_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
    });
  }

  /**
   * Clean up client-trainer interactions
   */
  async cleanupClientTrainerInteractions(
    clientId: string,
    trainerId: string
  ): Promise<ServiceResponse<CleanupResult>> {
    try {
      const { data, error } = await supabase.rpc(
        'admin_cleanup_client_trainer_interactions',
        {
          p_client_id: clientId,
          p_trainer_id: trainerId
        }
      );

      if (error) throw error;
      return { success: true, data: data as unknown as CleanupResult };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Update user email (admin only)
   */
  async updateUserEmail(request: UpdateEmailRequest): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase.rpc(
        'update_user_email_for_admin',
        {
          target_user_id: request.targetUserId,
          new_email: request.newEmail
        }
      );

      if (error) throw error;
      return { success: true, data: data as boolean };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Update all user passwords (dev/testing only)
   */
  async updateAllPasswordsDev(): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.rpc('update_all_user_passwords_dev_simple');
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Update trainer verification status
   */
  async updateVerificationStatus(
    request: UpdateVerificationRequest
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.rpc(
        'update_trainer_verification_status',
        {
          p_trainer_id: request.trainerId,
          p_status: request.status,
          p_admin_notes: request.adminNotes,
          p_rejection_reason: request.rejectionReason
        }
      );

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Get app settings
   */
  async getAppSettings(): Promise<ServiceResponse<any[]>> {
    return BaseService.executeListQuery(async () => {
      return await supabase
        .from('app_settings')
        .select('*')
        .order('setting_key');
    });
  }

  /**
   * Update app setting
   */
  async updateAppSetting(
    settingKey: string,
    settingValue: any
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: settingValue,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Sync verification fields
   */
  async syncVerificationFields(): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.rpc('sync_verification_fields');
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Get all membership plan definitions
   */
  async getMembershipPlans(): Promise<ServiceResponse<any[]>> {
    return BaseService.executeListQuery(async () => {
      return await supabase
        .from('membership_plan_definitions' as any)
        .select('*')
        .order('monthly_price_cents', { ascending: false });
    });
  }

  /**
   * Create a new membership plan
   */
  async createMembershipPlan(request: any): Promise<ServiceResponse<string>> {
    try {
      const { data, error } = await supabase.rpc('admin_create_membership_plan' as any, {
        p_plan_name: request.plan_name,
        p_display_name: request.display_name,
        p_description: request.description || null,
        p_monthly_price_cents: request.monthly_price_cents,
        p_has_package_commission: request.has_package_commission,
        p_commission_fee_type: request.commission_fee_type || null,
        p_commission_fee_value_percent: request.commission_fee_value_percent || null,
        p_commission_fee_value_flat_cents: request.commission_fee_value_flat_cents || null,
        p_is_available_to_new_trainers: request.is_available_to_new_trainers ?? true,
        p_stripe_product_id: request.stripe_product_id || null,
        p_stripe_price_id: request.stripe_price_id || null
      });
      
      if (error) throw error;
      return { success: true, data: data as string };
    } catch (error: any) {
      const errorMessage = error?.message || error?.hint || JSON.stringify(error);
      console.error('Error creating membership plan:', error);
      return { success: false, error: { code: 'ERROR', message: errorMessage } };
    }
  }

  /**
   * Update an existing membership plan
   */
  async updateMembershipPlan(request: any): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.rpc('admin_update_membership_plan' as any, {
        p_plan_id: request.plan_id,
        p_plan_name: request.plan_name || null,
        p_display_name: request.display_name || null,
        p_description: request.description || null,
        p_monthly_price_cents: request.monthly_price_cents || null,
        p_has_package_commission: request.has_package_commission ?? null,
        p_commission_fee_type: request.commission_fee_type || null,
        p_commission_fee_value_percent: request.commission_fee_value_percent || null,
        p_commission_fee_value_flat_cents: request.commission_fee_value_flat_cents || null,
        p_is_available_to_new_trainers: request.is_available_to_new_trainers ?? null,
        p_stripe_product_id: request.stripe_product_id || null,
        p_stripe_price_id: request.stripe_price_id || null
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || error?.hint || JSON.stringify(error);
      console.error('Error updating membership plan:', error);
      return { success: false, error: { code: 'ERROR', message: errorMessage } };
    }
  }

  /**
   * Archive a membership plan
   */
  async archiveMembershipPlan(planId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.rpc('admin_archive_membership_plan' as any, {
        p_plan_id: planId
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || error?.hint || JSON.stringify(error);
      console.error('Error archiving membership plan:', error);
      return { success: false, error: { code: 'ERROR', message: errorMessage } };
    }
  }

  /**
   * Get membership plan statistics
   */
  async getMembershipPlanStats(): Promise<ServiceResponse<Record<string, number>>> {
    try {
      const { data, error } = await supabase
        .from('trainer_membership' as any)
        .select('plan_definition_id')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Count trainers per plan
      const stats: Record<string, number> = {};
      (data as any)?.forEach((membership: any) => {
        const planId = membership.plan_definition_id;
        if (planId) {
          stats[planId] = (stats[planId] || 0) + 1;
        }
      });
      
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }
}

export const AdminService = new AdminServiceClass();
export { AdminServiceClass };
