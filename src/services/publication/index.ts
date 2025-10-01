/**
 * Publication Service
 * 
 * Handles profile publication requests and reviews
 */

import { BaseService } from '../base/BaseService';
import { ServiceError } from '../base/ServiceError';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import type { ServiceResponse } from '../types';

export class PublicationServiceClass extends BaseService {
  /**
   * Request profile publication
   */
  static async requestProfilePublication(): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.db.rpc('request_profile_publication');

      if (error) throw error;
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Review profile publication request (admin only)
   */
  static async reviewProfilePublication(
    requestId: string,
    action: 'approved' | 'rejected' | 'pending',
    adminNotes?: string,
    rejectionReason?: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.db.rpc('review_profile_publication', {
        p_request_id: requestId,
        p_action: action,
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
   * Get publication requests (admin only)
   */
  static async getPublicationRequests(
    statusFilter?: 'approved' | 'rejected' | 'pending'
  ): Promise<ServiceResponse<any[]>> {
    return this.executeListQuery(async () => {
      let query = this.db
        .from('profile_publication_requests')
        .select('*, profiles(first_name, last_name, email)')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      return await query;
    });
  }

  /**
   * Get current user's publication request
   */
  static async getMyPublicationRequest(): Promise<ServiceResponse<any>> {
    const userIdResponse = await this.getCurrentUserId();
    if (!userIdResponse.success || !userIdResponse.data) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated.')
      );
    }

    return this.executeMaybeQuery(async () => {
      return await this.db
        .from('profile_publication_requests')
        .select('*')
        .eq('trainer_id', userIdResponse.data!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    });
  }
}

export const PublicationService = PublicationServiceClass;
