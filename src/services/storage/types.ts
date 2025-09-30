/**
 * Storage Service Types
 */

export type StorageBucket = 
  | 'trainer-images'
  | 'onboarding-public'
  | 'avatars'
  | 'documents'
  | 'verification-documents';

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
