/**
 * Base Service Class
 * 
 * Provides common functionality for all services including:
 * - Supabase client access
 * - Error handling utilities
 * - Common database operation patterns
 * - Response standardization
 */

import { supabase } from '@/integrations/supabase/client';
import { ServiceError } from './ServiceError';
import { ServiceResponseHelper } from './ServiceResponse';
import type { ServiceResponse, PaginationParams, PaginatedResponse } from '../types';

export abstract class BaseService {
  /**
   * Protected Supabase client instance
   * Available to all service classes
   */
  protected static get db() {
    return supabase;
  }

  /**
   * Get the current authenticated user ID
   */
  protected static async getCurrentUserId(): Promise<ServiceResponse<string>> {
    try {
      const { data: { user }, error } = await this.db.auth.getUser();
      
      if (error) {
        return ServiceResponseHelper.error(ServiceError.fromError(error));
      }
      
      if (!user) {
        return ServiceResponseHelper.error(ServiceError.unauthorized('No authenticated user'));
      }
      
      return ServiceResponseHelper.success(user.id);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get the current authenticated user
   */
  protected static async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.db.auth.getUser();
      
      if (error) {
        return ServiceResponseHelper.error(ServiceError.fromError(error));
      }
      
      if (!user) {
        return ServiceResponseHelper.error(ServiceError.unauthorized('No authenticated user'));
      }
      
      return ServiceResponseHelper.success(user);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Execute a database query with standardized error handling
   */
  protected static async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        return ServiceResponseHelper.error(ServiceError.database(error.message, error));
      }
      
      if (data === null) {
        return ServiceResponseHelper.error(ServiceError.notFound('Resource'));
      }
      
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Execute a database query that may return null (optional result)
   */
  protected static async executeMaybeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<ServiceResponse<T | null>> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        return ServiceResponseHelper.error(ServiceError.database(error.message, error));
      }
      
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Execute a database query for multiple records
   */
  protected static async executeListQuery<T>(
    queryFn: () => Promise<{ data: T[] | null; error: any }>
  ): Promise<ServiceResponse<T[]>> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        return ServiceResponseHelper.error(ServiceError.database(error.message, error));
      }
      
      return ServiceResponseHelper.success(data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Execute a paginated database query
   */
  protected static async executePaginatedQuery<T>(
    queryFn: (offset: number, limit: number) => Promise<{ data: T[] | null; error: any; count?: number | null }>,
    params: PaginationParams = {}
  ): Promise<ServiceResponse<PaginatedResponse<T>>> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = params.offset !== undefined ? params.offset : (page - 1) * limit;
      
      const { data, error, count } = await queryFn(offset, limit);
      
      if (error) {
        return ServiceResponseHelper.error(ServiceError.database(error.message, error));
      }
      
      const total = count || 0;
      const hasMore = offset + limit < total;
      
      return ServiceResponseHelper.success({
        data: data || [],
        total,
        page,
        limit,
        hasMore,
      });
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Execute a mutation (insert, update, delete) with standardized error handling
   */
  protected static async executeMutation<T>(
    mutationFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await mutationFn();
      
      if (error) {
        return ServiceResponseHelper.error(ServiceError.database(error.message, error));
      }
      
      if (data === null) {
        return ServiceResponseHelper.error(
          ServiceError.database('Mutation failed: no data returned')
        );
      }
      
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Check if the current user has a specific role
   */
  protected static async hasRole(role: 'admin' | 'trainer' | 'client'): Promise<boolean> {
    try {
      const userResult = await this.getCurrentUserId();
      
      if (!userResult.success || !userResult.data) {
        return false;
      }
      
      const { data } = await this.db
        .from('user_roles')
        .select('role')
        .eq('user_id', userResult.data)
        .eq('role', role)
        .maybeSingle();
      
      return data !== null;
    } catch {
      return false;
    }
  }

  /**
   * Validate required fields
   */
  protected static validateRequired<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[]
  ): ServiceError | null {
    const missing = requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missing.length > 0) {
      return ServiceError.validation(
        `Missing required fields: ${missing.join(', ')}`,
        { missing }
      );
    }
    
    return null;
  }

  /**
   * Handle file upload to Supabase Storage
   */
  protected static async uploadFile(
    bucket: string,
    path: string,
    file: File
  ): Promise<ServiceResponse<string>> {
    try {
      const { data, error } = await this.db.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
        });
      
      if (error) {
        return ServiceResponseHelper.error(ServiceError.database(error.message, error));
      }
      
      const { data: urlData } = this.db.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      return ServiceResponseHelper.success(urlData.publicUrl);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Handle file deletion from Supabase Storage
   */
  protected static async deleteFile(
    bucket: string,
    path: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.db.storage
        .from(bucket)
        .remove([path]);
      
      if (error) {
        return ServiceResponseHelper.error(ServiceError.database(error.message, error));
      }
      
      return ServiceResponseHelper.success(undefined as void);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }
}
