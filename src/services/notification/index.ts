/**
 * Notification Service
 * 
 * Handles notification creation, delivery, and preference management.
 */

import { supabase } from '@/integrations/supabase/client';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import { BaseService } from '../base/BaseService';
import type { ServiceResponse } from '../types';
import type {
  NotificationPreferences,
  CreateNotificationRequest,
} from './types';

// Use the alerts table structure directly
interface AlertRecord {
  id: string;
  alert_type: string;
  title: string;
  content: string;
  created_at: string;
  is_active: boolean;
  metadata?: any;
  priority: number;
}

class NotificationServiceClass extends BaseService {
  /**
   * Get notifications for current user
   */
  static async getNotifications(limit = 50, unreadOnly = false): Promise<ServiceResponse<AlertRecord[]>> {
    return this.executeListQuery(async () => {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId.success || !currentUserId.data) {
        throw ServiceError.unauthorized('User not authenticated');
      }

      let query = supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      return query;
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<ServiceResponse<void>> {
    return this.executeMutation(async () => {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId.success || !currentUserId.data) {
        throw ServiceError.unauthorized('User not authenticated');
      }

      // Use the acknowledge_activity function
      const { data, error } = await supabase.rpc('acknowledge_activity', {
        p_alert_id: notificationId,
      });

      if (error) throw error;

      return { data: null, error: null };
    });
  }

  /**
   * Get notification preferences for current user
   */
  static async getPreferences(): Promise<ServiceResponse<NotificationPreferences>> {
    return this.executeQuery(async () => {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId.success || !currentUserId.data) {
        throw ServiceError.unauthorized('User not authenticated');
      }

      // Placeholder - implement based on your preferences table structure
      return {
        data: {
          user_id: currentUserId.data,
          email_notifications: true,
          push_notifications: true,
          message_notifications: true,
          booking_notifications: true,
          payment_notifications: true,
          marketing_notifications: false,
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    });
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<ServiceResponse<NotificationPreferences>> {
    return this.executeMutation(async () => {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId.success || !currentUserId.data) {
        throw ServiceError.unauthorized('User not authenticated');
      }

      // Placeholder - implement based on your preferences table structure
      return {
        data: {
          user_id: currentUserId.data,
          ...preferences,
          updated_at: new Date().toISOString(),
        } as NotificationPreferences,
        error: null,
      };
    });
  }
}

export const NotificationService = NotificationServiceClass;
export { NotificationServiceClass };
