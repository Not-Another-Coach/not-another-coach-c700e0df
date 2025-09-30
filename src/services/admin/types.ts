/**
 * Admin Types
 */

export interface AdminStats {
  total_users: number;
  total_trainers: number;
  total_clients: number;
  active_trainers: number;
  pending_reviews: number;
  total_revenue: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}

export interface ReviewableProfile {
  id: string;
  trainer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo_url?: string;
  publication_requested_at: string;
  profile_status: 'pending_review';
  bio?: string;
  specializations: string[];
  qualifications: string[];
}

export interface ProfileReviewDecision {
  profile_id: string;
  approved: boolean;
  rejection_reason?: string;
  admin_notes?: string;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  user_type: 'client' | 'trainer' | 'admin';
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SystemSettings {
  platform_fee_percentage: number;
  min_hourly_rate: number;
  max_hourly_rate: number;
  enable_notifications: boolean;
  maintenance_mode: boolean;
  [key: string]: any;
}
