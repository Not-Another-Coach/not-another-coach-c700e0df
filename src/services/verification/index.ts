/**
 * Verification Service
 * 
 * Handles trainer verification processes including document submission,
 * verification checks, and status management
 */

import { supabase } from '@/integrations/supabase/client';
import { BaseService } from '../base/BaseService';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import { ServiceResponse } from '../types';
import type {
  VerificationRequest,
  VerificationCheck,
  VerificationOverview,
  SubmitVerificationRequest,
  UpdateCheckRequest
} from './types';

class VerificationServiceClass extends BaseService {
  /**
   * Get trainer's verification request
   */
  async getVerificationRequest(trainerId?: string): Promise<ServiceResponse<VerificationRequest | null>> {
    return BaseService.executeMaybeQuery(async () => {
      const userId = trainerId || (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('No user ID provided');

      return await supabase
        .from('trainer_verification_requests')
        .select('*')
        .eq('trainer_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    });
  }

  /**
   * Get all verification requests (admin only)
   */
  async getAllVerificationRequests(): Promise<ServiceResponse<VerificationRequest[]>> {
    return BaseService.executeListQuery(async () => {
      return await supabase
        .from('trainer_verification_requests')
        .select('*, profiles!trainer_verification_requests_trainer_id_fkey(*)')
        .order('created_at', { ascending: false });
    });
  }

  /**
   * Submit verification request
   */
  async submitVerificationRequest(
    request: SubmitVerificationRequest
  ): Promise<ServiceResponse<VerificationRequest>> {
    return BaseService.executeMutation(async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      return await supabase
        .from('trainer_verification_requests')
        .insert({
          trainer_id: user.id,
          documents: request.documents,
          status: 'pending'
        })
        .select()
        .single();
    });
  }

  /**
   * Get verification checks for a trainer
   */
  async getVerificationChecks(trainerId?: string): Promise<ServiceResponse<VerificationCheck[]>> {
    return BaseService.executeListQuery(async () => {
      const userId = trainerId || (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('No user ID provided');

      return await supabase
        .from('trainer_verification_checks')
        .select('*')
        .eq('trainer_id', userId)
        .order('created_at', { ascending: false });
    });
  }

  /**
   * Submit verification check document
   */
  async submitVerificationCheck(
    checkType: VerificationCheck['check_type'],
    evidenceUrl: string,
    expiryDate?: string
  ): Promise<ServiceResponse<VerificationCheck>> {
    return BaseService.executeMutation(async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      return await supabase
        .from('trainer_verification_checks')
        .insert({
          trainer_id: user.id,
          check_type: checkType,
          evidence_file_url: evidenceUrl,
          expiry_date: expiryDate,
          status: 'pending'
        })
        .select()
        .single();
    });
  }

  /**
   * Update verification check (admin only)
   */
  async updateVerificationCheck(
    request: UpdateCheckRequest
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('trainer_verification_checks')
        .update({
          status: request.status,
          notes: request.notes,
          expiry_date: request.expiryDate,
          verified_at: request.status === 'verified' ? new Date().toISOString() : null,
          verified_by: request.status === 'verified' 
            ? (await supabase.auth.getUser()).data.user?.id 
            : null
        })
        .eq('id', request.checkId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Get verification overview
   */
  async getVerificationOverview(trainerId?: string): Promise<ServiceResponse<VerificationOverview | null>> {
    return BaseService.executeMaybeQuery(async () => {
      const userId = trainerId || (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('No user ID provided');

      return await supabase
        .from('trainer_verification_overview')
        .select('*')
        .eq('trainer_id', userId)
        .maybeSingle();
    });
  }

  /**
   * Submit verification request
   */
  static async submitVerificationRequest(
    documents: Record<string, string>
  ): Promise<ServiceResponse<any>> {
    const userIdResponse = await this.getCurrentUserId();
    if (!userIdResponse.success || !userIdResponse.data) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated.')
      );
    }

    return this.executeMutation(async () => {
      return await this.db
        .from('trainer_verification_requests')
        .insert([{
          trainer_id: userIdResponse.data!,
          documents,
          status: 'pending'
        }])
        .select()
        .single();
    });
  }

  /**
   * Request trainer verification (RPC)
   */
  static async requestTrainerVerification(): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.db.rpc('request_trainer_verification', {});

      if (error) throw error;
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Update trainer verification status (admin only)
   */
  static async updateTrainerVerificationStatus(
    trainerId: string,
    status: 'pending' | 'verified' | 'rejected',
    adminNotes?: string,
    rejectionReason?: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.db.rpc('update_trainer_verification_status', {
        p_trainer_id: trainerId,
        p_status: status as any,
        p_admin_notes: adminNotes || null,
        p_rejection_reason: rejectionReason || null
      });

      if (error) throw error;
      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Admin update verification check
   */
  static async adminUpdateVerificationCheck(
    checkId: string,
    status: 'pending' | 'verified' | 'rejected' | 'expired',
    notes?: string
  ): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.db.rpc('admin_update_verification_check', {
        p_check_id: checkId,
        p_status: status,
        p_admin_notes: notes || null
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get admin verification activities
   */
  static async getAdminVerificationActivities(
    filters?: Record<string, any>
  ): Promise<ServiceResponse<any[]>> {
    try {
      const { data: rpcData, error: rpcError } = await this.db.rpc('get_admin_verification_activities', {
        ...(filters || {})
      });

      if (rpcError) throw rpcError;
      return ServiceResponseHelper.success(rpcData || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }
}

export const VerificationService = VerificationServiceClass;
export { VerificationServiceClass };
