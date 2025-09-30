/**
 * Trainer Service
 * 
 * Handles trainer-specific operations including:
 * - Trainer discovery and search
 * - Trainer profile management
 * - Trainer filtering and pagination
 */

import { BaseService } from '../base/BaseService';
import { ServiceError } from '../base/ServiceError';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import type { ServiceResponse, PaginationParams, PaginatedResponse } from '../types';

export interface TrainerSearchFilters {
  searchTerm?: string;
  goal?: string;
  location?: string;
  availability?: string;
  minRate?: number;
  maxRate?: number;
  isVerified?: boolean;
}

export interface TrainerProfile {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  location?: string;
  specializations?: string[];
  qualifications?: string[];
  hourly_rate?: number;
  rating?: number;
  total_ratings?: number;
  is_verified: boolean;
  profile_photo_url?: string;
  profile_image_position?: any;
  training_types?: string[];
  testimonials?: any[];
}

export class TrainerService extends BaseService {
  /**
   * Get all published trainers with optional filters
   */
  static async getPublishedTrainers(
    filters?: TrainerSearchFilters,
    pagination?: PaginationParams
  ): Promise<ServiceResponse<any[]>> {
    return this.executeListQuery(async () => {
      let query = this.db
        .from('v_trainers')
        .select(`
          id,
          first_name,
          last_name,
          bio,
          location,
          specializations,
          qualifications,
          hourly_rate,
          rating,
          total_ratings,
          is_verified,
          profile_photo_url,
          profile_image_position,
          training_types,
          testimonials
        `)
        .eq('profile_published', true);

      // Apply filters
      if (filters) {
        if (filters.searchTerm) {
          query = query.or(`first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,bio.ilike.%${filters.searchTerm}%`);
        }

        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }

        if (filters.minRate !== undefined) {
          query = query.gte('hourly_rate', filters.minRate);
        }

        if (filters.maxRate !== undefined) {
          query = query.lte('hourly_rate', filters.maxRate);
        }

        if (filters.isVerified !== undefined) {
          query = query.eq('is_verified', filters.isVerified);
        }
      }

      // Apply pagination
      if (pagination) {
        const offset = pagination.offset || ((pagination.page || 1) - 1) * (pagination.limit || 10);
        const limit = pagination.limit || 10;
        query = query.range(offset, offset + limit - 1);
      }

      return await query;
    });
  }

  /**
   * Get trainer by ID
   */
  static async getTrainerById(trainerId: string): Promise<ServiceResponse<any>> {
    if (!trainerId) {
      return ServiceResponseHelper.error(
        ServiceError.validation('Trainer ID is required.')
      );
    }

    return this.executeQuery(async () => {
      return await this.db
        .from('v_trainers')
        .select(`
          id,
          first_name,
          last_name,
          bio,
          location,
          specializations,
          qualifications,
          hourly_rate,
          rating,
          total_ratings,
          is_verified,
          profile_photo_url,
          profile_image_position,
          training_types,
          testimonials
        `)
        .eq('id', trainerId)
        .eq('profile_published', true)
        .single();
    });
  }

  /**
   * Get trainer profile (extended information)
   */
  static async getTrainerProfile(trainerId: string): Promise<ServiceResponse<any>> {
    if (!trainerId) {
      return ServiceResponseHelper.error(
        ServiceError.validation('Trainer ID is required.')
      );
    }

    return this.executeQuery(async () => {
      return await this.db
        .from('profiles')
        .select('*')
        .eq('id', trainerId)
        .eq('user_type', 'trainer')
        .single();
    });
  }

  /**
   * Search trainers with advanced filtering
   */
  static async searchTrainers(
    filters: TrainerSearchFilters,
    pagination?: PaginationParams
  ): Promise<ServiceResponse<PaginatedResponse<any>>> {
    const trainersResponse = await this.getPublishedTrainers(filters, pagination);

    if (!trainersResponse.success || !trainersResponse.data) {
      return ServiceResponseHelper.error(
        trainersResponse.error || ServiceError.database('Failed to fetch trainers')
      );
    }

    // Get total count for pagination
    const countResponse = await this.executeQuery(async () => {
      let countQuery = this.db
        .from('v_trainers')
        .select('id', { count: 'exact', head: true })
        .eq('profile_published', true);

      if (filters.searchTerm) {
        countQuery = countQuery.or(`first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,bio.ilike.%${filters.searchTerm}%`);
      }

      if (filters.location) {
        countQuery = countQuery.ilike('location', `%${filters.location}%`);
      }

      return await countQuery;
    });

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const total = (countResponse.data as any)?.count || trainersResponse.data.length;

    const paginatedResponse: PaginatedResponse<TrainerProfile> = {
      data: trainersResponse.data,
      total,
      page,
      limit,
      hasMore: page * limit < total
    };

    return ServiceResponseHelper.success(paginatedResponse);
  }

  /**
   * Get trainer's complete profile with all related data
   */
  static async getCompleteTrainerProfile(trainerId: string): Promise<ServiceResponse<any>> {
    const baseProfileResponse = await this.getTrainerById(trainerId);

    if (!baseProfileResponse.success || !baseProfileResponse.data) {
      return baseProfileResponse;
    }

    // Could extend this to fetch additional related data like:
    // - Instagram posts
    // - Availability
    // - Packages
    // For now, just return the base profile

    return baseProfileResponse;
  }

  /**
   * Update trainer profile (for current user)
   */
  static async updateTrainerProfile(updates: any): Promise<ServiceResponse<any>> {
    const userIdResponse = await this.getCurrentUserId();
    if (!userIdResponse.success || !userIdResponse.data) {
      return ServiceResponseHelper.error(userIdResponse.error!);
    }

    // Verify user is a trainer
    const isTrainer = await this.hasRole('trainer');
    if (!isTrainer) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('Only trainers can update trainer profiles.')
      );
    }

    return this.executeMutation(async () => {
      return await this.db
        .from('profiles')
        .update(updates)
        .eq('id', userIdResponse.data)
        .eq('user_type', 'trainer')
        .select()
        .single();
    });
  }
}
