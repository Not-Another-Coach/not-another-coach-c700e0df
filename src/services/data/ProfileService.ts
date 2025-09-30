/**
 * Profile Service
 * 
 * Handles all profile-related operations including:
 * - Profile data management
 * - Authentication operations (password reset, email updates)
 * - File uploads for profile photos
 */

import { BaseService } from '../base/BaseService';
import { ServiceError } from '../base/ServiceError';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import type { ServiceResponse, ProfileUpdateData } from '../types';

export class ProfileService extends BaseService {
  /**
   * Get the current user's profile with type detection
   */
  static async getCurrentUserProfile(): Promise<ServiceResponse<any>> {
    const userIdResponse = await this.getCurrentUserId();
    if (!userIdResponse.success || !userIdResponse.data) {
      return ServiceResponseHelper.error(userIdResponse.error!);
    }

    return this.executeQuery(async () => {
      return await this.db
        .from('profiles')
        .select('*')
        .eq('id', userIdResponse.data)
        .single();
    });
  }

  /**
   * Update profile data with validation
   */
  static async updateProfile(updates: ProfileUpdateData): Promise<ServiceResponse<any>> {
    const userIdResponse = await this.getCurrentUserId();
    if (!userIdResponse.success || !userIdResponse.data) {
      return ServiceResponseHelper.error(userIdResponse.error!);
    }

    // Validate required fields if present
    const validationError = this.validateRequired(updates, []);
    if (validationError) {
      return ServiceResponseHelper.error(validationError);
    }

    return this.executeMutation(async () => {
      return await this.db
        .from('profiles')
        .update(updates)
        .eq('id', userIdResponse.data)
        .select()
        .single();
    });
  }

  /**
   * Upload profile photo to storage
   */
  static async uploadProfilePhoto(file: File): Promise<ServiceResponse<string>> {
    const userIdResponse = await this.getCurrentUserId();
    if (!userIdResponse.success || !userIdResponse.data) {
      return ServiceResponseHelper.error(userIdResponse.error!);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return ServiceResponseHelper.error(
        ServiceError.validation('Invalid file type. Please upload an image file.')
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return ServiceResponseHelper.error(
        ServiceError.validation('File too large. Please upload an image smaller than 5MB.')
      );
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userIdResponse.data}-${Date.now()}.${fileExt}`;
    
    return this.uploadFile('client-photos', fileName, file);
  }

  /**
   * Reset password for current user
   */
  static async resetPassword(email: string): Promise<ServiceResponse<void>> {
    if (!email) {
      return ServiceResponseHelper.error(
        ServiceError.validation('Email is required for password reset.')
      );
    }

    try {
      const { error } = await this.db.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      });

      if (error) throw error;

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Update user email
   */
  static async updateEmail(newEmail: string): Promise<ServiceResponse<void>> {
    if (!newEmail) {
      return ServiceResponseHelper.error(
        ServiceError.validation('New email is required.')
      );
    }

    try {
      const { error } = await this.db.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get profile by user ID
   */
  static async getProfileById(userId: string): Promise<ServiceResponse<any>> {
    if (!userId) {
      return ServiceResponseHelper.error(
        ServiceError.validation('User ID is required.')
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
}
