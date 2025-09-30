/**
 * Content Service Types
 */

export type AlertType = 
  | 'message'
  | 'booking'
  | 'payment'
  | 'profile_update'
  | 'system'
  | 'reminder'
  | 'verification_update'
  | 'discovery_call_booked'
  | 'coach_selection_request';

export interface Alert {
  id: string;
  alert_type: AlertType;
  title: string;
  content: string;
  target_audience: Record<string, any>;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_by?: string;
  expires_at?: string;
  priority: number;
  correlation_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAlertRequest {
  alert_type: AlertType;
  title: string;
  content: string;
  target_audience: Record<string, any>;
  metadata?: Record<string, any>;
  priority?: number;
  expires_at?: string;
}

export interface HighlightContent {
  id: string;
  content_type: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  visibility_settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HighlightSubmission {
  id: string;
  trainer_id: string;
  content_type: string;
  submission_data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHighlightSubmissionRequest {
  content_type: string;
  submission_data: Record<string, any>;
}
