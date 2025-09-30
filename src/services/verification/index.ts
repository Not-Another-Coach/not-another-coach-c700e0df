/**
 * Verification Service
 * 
 * Handles trainer verification processes including document submission,
 * verification checks, and status management
 */

import { supabase } from '@/integrations/supabase/client';
import { BaseService } from '../base/BaseService';
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
   * Update verification display preference
   */
  async updateDisplayPreference(
    preference: 'hidden' | 'verified_allowed'
  ): Promise<ServiceResponse<void>> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('trainer_verification_overview')
        .update({ display_preference: preference })
        .eq('trainer_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }
}

export const VerificationService = new VerificationServiceClass();
export { VerificationServiceClass };
