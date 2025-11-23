/**
 * User Service
 * 
 * Handles user management operations including roles, suspension, and admin functions
 */

import { BaseService } from '../base/BaseService';
import { ServiceError } from '../base/ServiceError';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import type { ServiceResponse } from '../types';

interface UserEmail {
  user_id: string;
  email: string;
}

export class UserServiceClass extends BaseService {
  /**
   * Check if current user is admin
   */
  static async isCurrentUserAdmin(): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await this.db.rpc('is_current_user_admin');

      if (error) throw error;
      return ServiceResponseHelper.success(data as boolean);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get user emails for admin (requires admin role)
   */
  static async getUserEmailsForAdmin(): Promise<ServiceResponse<UserEmail[]>> {
    try {
      const { data, error } = await this.db.rpc('get_user_emails_for_admin');

      if (error) throw error;
      return ServiceResponseHelper.success(data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get user emails for development (dev environment only)
   */
  static async getUserEmailsForDevelopment(): Promise<ServiceResponse<UserEmail[]>> {
    try {
      const { data, error } = await this.db.rpc('get_user_emails_for_development');

      if (error) throw error;
      return ServiceResponseHelper.success(data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * List users with minimal info (admin only)
   */
  static async listUsersMinimalAdmin(): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await this.db.rpc('list_users_minimal_admin');

      if (error) throw error;
      return ServiceResponseHelper.success(data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Suspend user (admin only)
   */
  static async suspendUser(
    userId: string,
    reason: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.db.rpc('suspend_user', {
        p_user_id: userId,
        p_reason: reason
      });

      if (error) throw error;
      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Reactivate user (admin only)
   */
  static async reactivateUser(userId: string, reason?: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.db.rpc('reactivate_user', {
        p_user_id: userId,
        p_reason: reason
      });

      if (error) throw error;
      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Update admin notes for user (admin only)
   */
  static async updateAdminNotes(
    userId: string,
    notes: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.db.rpc('update_admin_notes', {
        p_user_id: userId,
        p_notes: notes
      });

      if (error) throw error;
      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Restrict user communication (admin only)
   */
  static async restrictCommunication(
    userId: string,
    reason: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.db.rpc('restrict_communication', {
        p_user_id: userId,
        p_reason: reason
      });

      if (error) throw error;
      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Update user email (admin only)
   */
  static async updateUserEmail(
    userId: string,
    newEmail: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await this.db.rpc('update_user_email_for_admin', {
        target_user_id: userId,
        new_email: newEmail
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data as boolean);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }
}

export const UserService = UserServiceClass;
