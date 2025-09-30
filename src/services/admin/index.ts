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
}

export const AdminService = new AdminServiceClass();
export { AdminServiceClass };
