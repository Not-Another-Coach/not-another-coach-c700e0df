/**
 * Notification Types
 */

export type NotificationType = 
  | 'message'
  | 'booking'
  | 'payment'
  | 'profile_update'
  | 'system'
  | 'reminder';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  message_notifications: boolean;
  booking_notifications: boolean;
  payment_notifications: boolean;
  marketing_notifications: boolean;
  updated_at: string;
}

export interface CreateNotificationRequest {
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, any>;
}
