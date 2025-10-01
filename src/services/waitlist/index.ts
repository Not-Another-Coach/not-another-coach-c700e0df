/**
 * Waitlist Service
 * 
 * Handles waitlist exclusive periods and client access
 */

import { BaseService } from '../base/BaseService';
import { ServiceError } from '../base/ServiceError';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import type { ServiceResponse } from '../types';

export class WaitlistServiceClass extends BaseService {
  /**
   * Start waitlist exclusive period
   */
  static async startWaitlistExclusivePeriod(
    trainerId: string,
    durationHours: number
  ): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.db.rpc('start_waitlist_exclusive_period', {
        p_coach_id: trainerId,
        p_duration_hours: durationHours
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * End waitlist exclusive period
   */
  static async endWaitlistExclusivePeriod(
    trainerId: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.db.rpc('end_waitlist_exclusive_period', {
        p_coach_id: trainerId
      });

      if (error) throw error;
      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Check if client has waitlist exclusive access
   */
  static async clientHasWaitlistExclusiveAccess(
    trainerId: string,
    clientId?: string
  ): Promise<ServiceResponse<boolean>> {
    const effectiveClientId = clientId || (await this.getCurrentUserId()).data;
    
    if (!effectiveClientId) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated.')
      );
    }

    try {
      const { data, error } = await this.db.rpc('client_has_waitlist_exclusive_access', {
        p_coach_id: trainerId,
        p_client_id: effectiveClientId
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data as boolean);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }
}

export const WaitlistService = WaitlistServiceClass;
