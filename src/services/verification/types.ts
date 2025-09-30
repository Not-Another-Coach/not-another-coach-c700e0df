/**
 * Verification Service Types
 */

export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type VerificationCheckType = 
  | 'cimspa_membership'
  | 'insurance_proof'
  | 'first_aid_certification'
  | 'qualifications'
  | 'identity_match';

export interface VerificationRequest {
  id: string;
  trainer_id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  documents: any[];
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationCheck {
  id: string;
  trainer_id: string;
  check_type: VerificationCheckType;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  evidence_file_url?: string;
  expiry_date?: string;
  notes?: string;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationOverview {
  trainer_id: string;
  overall_status: 'not_shown' | 'verified' | 'expired';
  display_preference: 'visible' | 'hidden';
  last_computed_at: string;
  created_at: string;
  updated_at: string;
}

export interface SubmitVerificationRequest {
  documents: any[];
}

export interface UpdateCheckRequest {
  checkId: string;
  status: VerificationCheck['status'];
  notes?: string;
  expiryDate?: string;
}
