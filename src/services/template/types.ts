/**
 * Template Service Types
 */

export interface OnboardingTemplate {
  id: string;
  trainer_id: string;
  step_name: string;
  step_type: 'mandatory' | 'optional';
  description?: string;
  instructions?: string;
  requires_file_upload: boolean;
  completion_method: 'client' | 'trainer' | 'auto';
  display_order: number;
  is_active: boolean;
  status?: 'draft' | 'published' | 'archived';
  created_from_template_id?: string;
  package_links?: string[];
  auto_assign_on_package?: boolean;
  conditional_logic?: any;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateSection {
  id: string;
  template_id: string;
  section_name: string;
  section_order: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientTemplateAssignment {
  id: string;
  client_id: string;
  trainer_id: string;
  template_base_id?: string;
  template_name: string;
  status: 'active' | 'completed' | 'expired' | 'removed';
  assigned_at: string;
  expired_at?: string;
  removed_at?: string;
  removed_by?: string;
  removal_reason?: string;
  expiry_reason?: string;
  assignment_notes?: string;
  correlation_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientOnboardingProgress {
  id: string;
  client_id: string;
  trainer_id: string;
  assignment_id?: string;
  template_step_id?: string;
  activity_id?: string;
  step_name: string;
  step_type: 'mandatory' | 'optional';
  description?: string;
  instructions?: string;
  completion_method: 'client' | 'trainer' | 'auto';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  display_order: number;
  due_in_days?: number;
  due_at?: string;
  sla_days?: number;
  sla_due_at?: string;
  completed_at?: string;
  completed_by?: string;
  completion_notes?: string;
  trainer_notes?: string;
  requires_file_upload: boolean;
  uploaded_file_url?: string;
  attachments?: any;
  allowed_attachments?: any;
  visibility?: 'shared' | 'trainer_only' | 'client_only';
  overdue_alert_sent_at?: string;
  sla_alert_sent_at?: string;
  correlation_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TemplatePackageLink {
  id: string;
  template_id: string;
  package_id: string;
  package_name: string;
  auto_assign: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTemplateInput {
  step_name: string;
  step_type: 'mandatory' | 'optional';
  description?: string;
  instructions?: string;
  requires_file_upload: boolean;
  completion_method: 'client' | 'trainer' | 'auto';
  display_order: number;
  is_active: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateTemplateInput {
  step_name?: string;
  step_type?: 'mandatory' | 'optional';
  description?: string;
  instructions?: string;
  requires_file_upload?: boolean;
  completion_method?: 'client' | 'trainer' | 'auto';
  display_order?: number;
  is_active?: boolean;
  status?: 'draft' | 'published' | 'archived';
  conditional_logic?: any;
}

export interface AssignTemplateInput {
  client_id: string;
  template_name: string;
  template_base_id?: string;
  assignment_notes?: string;
}

export interface UpdateProgressInput {
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completion_notes?: string;
  trainer_notes?: string;
  uploaded_file_url?: string;
  attachments?: any;
  completed_at?: string;
  completed_by?: string;
}
