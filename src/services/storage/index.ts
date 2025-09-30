/**
 * File Upload and Storage Service
 * 
 * Handles all Supabase storage operations including file uploads, deletions, and URL generation.
 */

import { supabase } from '@/integrations/supabase/client';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import type { ServiceResponse } from '../types';
import type { 
  FileUploadOptions, 
  FileUploadResult, 
  PublicUrlResult,
  StorageBucket 
} from './types';

export const FileUploadService = {
  /**
   * Upload a file to a storage bucket
   */
  async uploadFile(
    bucket: StorageBucket,
    path: string,
    file: File,
    options: FileUploadOptions = {}
  ): Promise<ServiceResponse<FileUploadResult>> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false,
        });

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('File upload failed', error)
        );
      }

      // Get public URL for the uploaded file
      const publicUrlResponse = await this.getPublicUrl(bucket, data.path);
      
      return ServiceResponseHelper.success({
        path: data.path,
        publicUrl: publicUrlResponse.data?.publicUrl || '',
      });
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Get public URL for a file
   */
  async getPublicUrl(
    bucket: StorageBucket,
    path: string
  ): Promise<ServiceResponse<PublicUrlResult>> {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return ServiceResponseHelper.success({
        publicUrl: data.publicUrl,
      });
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(
    bucket: StorageBucket,
    path: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('File deletion failed', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Delete multiple files from storage
   */
  async deleteFiles(
    bucket: StorageBucket,
    paths: string[]
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Bulk file deletion failed', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * List files in a storage bucket path
   */
  async listFiles(
    bucket: StorageBucket,
    path: string = ''
  ): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to list files', error)
        );
      }

      return ServiceResponseHelper.success(data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Move/rename a file within a bucket
   */
  async moveFile(
    bucket: StorageBucket,
    fromPath: string,
    toPath: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath);

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('File move failed', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Generate a signed URL for temporary private access
   */
  async createSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn: number = 3600
  ): Promise<ServiceResponse<string>> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to create signed URL', error)
        );
      }

      return ServiceResponseHelper.success(data.signedUrl);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },
};
