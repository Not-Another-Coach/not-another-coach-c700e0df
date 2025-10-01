/**
 * Streak Service
 * 
 * Handles trainer streak tracking and statistics
 */

import { BaseService } from '../base/BaseService';
import { ServiceError } from '../base/ServiceError';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import type { ServiceResponse } from '../types';

export class StreakServiceClass extends BaseService {
  /**
   * Get trainer streak count
   */
  static async getTrainerStreakCount(
    trainerId?: string
  ): Promise<ServiceResponse<number>> {
    const effectiveTrainerId = trainerId || (await this.getCurrentUserId()).data;
    
    if (!effectiveTrainerId) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated.')
      );
    }

    try {
      const { data, error } = await this.db.rpc('get_trainer_streak_count', {
        trainer_uuid: effectiveTrainerId
      });

      if (error) throw error;
      return ServiceResponseHelper.success((data as number) || 0);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }
}

export const StreakService = StreakServiceClass;
