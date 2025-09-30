/**
 * Admin Service Types
 */

export interface AdminAction {
  id: string;
  admin_id: string;
  target_user_id: string;
  action_type: string;
  action_details: any;
  reason?: string;
  created_at: string;
}

export interface CleanupResult {
  messages: number;
  conversations: number;
  feedback_responses: number;
  feedback: number;
  call_notifications: number;
  feedback_notifications: number;
  call_notes: number;
  discovery_calls: number;
  selection_requests: number;
  waitlist_entries: number;
  commitment_acknowledgments: number;
  getting_started_progress: number;
  onboarding_progress: number;
  template_assignments: number;
  ongoing_support_agreements: number;
  conditional_evaluations: number;
  goal_client_links: number;
  instagram_revelations: number;
  alerts: number;
  engagement_records: number;
  journey_stage_reset: number;
}

export interface UpdateEmailRequest {
  targetUserId: string;
  newEmail: string;
}

export interface UpdatePasswordRequest {
  userIds: string[];
  newPassword: string;
}

export interface UpdateVerificationRequest {
  trainerId: string;
  status: 'pending' | 'verified' | 'rejected';
  adminNotes?: string;
  rejectionReason?: string;
}
