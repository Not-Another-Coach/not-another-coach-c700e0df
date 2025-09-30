/**
 * Profile Types
 */

export type UserType = 'client' | 'trainer' | 'admin';
export type ProfileStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'suspended';

export interface BaseProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_photo_url?: string;
  location?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_photo_url?: string;
  location?: string;
  timezone?: string;
}

export interface UserRole {
  user_id: string;
  role: string;
  created_at: string;
}
