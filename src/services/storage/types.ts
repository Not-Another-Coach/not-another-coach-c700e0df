/**
 * Storage Service Types
 */

export type StorageBucket = 
  | 'trainer-images'
  | 'trainer-verification-documents'
  | 'trainer-documents'
  | 'profile-photos'
  | 'client-photos'
  | 'onboarding'
  | 'onboarding-public'
  | 'onboarding-attachments'
  | 'qualification-proofs'
  | 'logos';

export interface FileUploadOptions {
  cacheControl?: string;
  upsert?: boolean;
}

export interface FileUploadResult {
  path: string;
  publicUrl: string;
}

export interface PublicUrlResult {
  publicUrl: string;
}
