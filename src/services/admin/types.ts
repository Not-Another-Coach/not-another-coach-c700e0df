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

export interface MembershipPlanDefinition {
  id: string;
  plan_name: string;
  plan_type: 'high' | 'low';
  display_name: string;
  description?: string;
  monthly_price_cents: number;
  has_package_commission: boolean;
  commission_fee_type?: 'percentage' | 'flat';
  commission_fee_value_percent?: number;
  commission_fee_value_flat_cents?: number;
  is_available_to_new_trainers: boolean;
  stripe_product_id?: string;
  stripe_price_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateMembershipPlanRequest {
  plan_name: string;
  plan_type: 'high' | 'low';
  display_name: string;
  description?: string;
  monthly_price_cents: number;
  has_package_commission: boolean;
  commission_fee_type?: 'percentage' | 'flat';
  commission_fee_value_percent?: number;
  commission_fee_value_flat_cents?: number;
  is_available_to_new_trainers?: boolean;
  stripe_product_id?: string;
  stripe_price_id?: string;
}

export interface UpdateMembershipPlanRequest {
  plan_id: string;
  display_name?: string;
  description?: string;
  monthly_price_cents?: number;
  has_package_commission?: boolean;
  commission_fee_type?: 'percentage' | 'flat';
  commission_fee_value_percent?: number;
  commission_fee_value_flat_cents?: number;
  is_available_to_new_trainers?: boolean;
  stripe_product_id?: string;
  stripe_price_id?: string;
}
