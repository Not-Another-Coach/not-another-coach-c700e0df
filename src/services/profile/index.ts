/**
 * Profile Service
 * 
 * Handles profile operations for both trainers and clients.
 */

import { supabase } from '@/integrations/supabase/client';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import { BaseService } from '../base/BaseService';
import type { ServiceResponse, ProfileUpdateData } from '../types';

class ProfileServiceClass extends BaseService {
  /**
   * Get current user's profile
   */
  static async getCurrentUserProfile(): Promise<ServiceResponse<any>> {
    return this.executeQuery(async () => {
      const userIdResponse = await this.getCurrentUserId();
      if (!userIdResponse.success || !userIdResponse.data) {
        throw ServiceError.unauthorized('User not authenticated');
      }

      return await this.db
        .from('profiles')
        .select('*')
        .eq('id', userIdResponse.data)
        .single();
    });
  }

  /**
   * Get profile by ID
   */
  static async getProfileById(userId: string): Promise<ServiceResponse<any>> {
    if (!userId) {
      return ServiceResponseHelper.error(
        ServiceError.validation('User ID is required')
      );
    }

    return this.executeQuery(async () => {
      return await this.db
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    });
  }

  /**
   * Update profile
   */
  static async updateProfile(
    userId: string,
    updates: ProfileUpdateData
  ): Promise<ServiceResponse<any>> {
    if (!userId) {
      return ServiceResponseHelper.error(
        ServiceError.validation('User ID is required')
      );
    }

    return this.executeMutation(async () => {
      return await this.db
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    });
  }

  /**
   * Update current user's profile
   */
  static async updateCurrentUserProfile(
    updates: ProfileUpdateData
  ): Promise<ServiceResponse<any>> {
    return this.executeMutation(async () => {
      const userIdResponse = await this.getCurrentUserId();
      if (!userIdResponse.success || !userIdResponse.data) {
        throw ServiceError.unauthorized('User not authenticated');
      }

      return await this.db
        .from('profiles')
        .update(updates)
        .eq('id', userIdResponse.data)
        .select()
        .single();
    });
  }
}

export const ProfileService = ProfileServiceClass;
export { ProfileServiceClass };
