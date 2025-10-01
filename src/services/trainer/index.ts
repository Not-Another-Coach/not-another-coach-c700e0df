/**
 * Trainer Service
 * 
 * Handles trainer-specific operations including profile management, 
 * availability, and trainer discovery.
 */

import { supabase } from '@/integrations/supabase/client';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import type { ServiceResponse } from '../types';

class TrainerServiceClass {
  /**
   * Migrate anonymous trainer session data to authenticated profile
   * @param anonymousData - The anonymous session data to migrate
   * @param userId - The authenticated user's ID
   */
  static async migrateAnonymousData(
    anonymousData: any,
    userId: string
  ): Promise<ServiceResponse<void>> {
    try {
      // Convert anonymous data to profile update format
      const profileUpdate: any = {};
      
      if (anonymousData.firstName) profileUpdate.first_name = anonymousData.firstName;
      if (anonymousData.lastName) profileUpdate.last_name = anonymousData.lastName;
      if (anonymousData.tagline) profileUpdate.tagline = anonymousData.tagline;
      if (anonymousData.bio) profileUpdate.bio = anonymousData.bio;
      if (anonymousData.location) profileUpdate.location = anonymousData.location;
      if (anonymousData.hourlyRate) profileUpdate.hourly_rate = anonymousData.hourlyRate;
      if (anonymousData.specializations) profileUpdate.specializations = anonymousData.specializations;
      if (anonymousData.trainingTypes) profileUpdate.training_types = anonymousData.trainingTypes;
      if (anonymousData.qualifications) profileUpdate.qualifications = anonymousData.qualifications;
      if (anonymousData.deliveryFormat) profileUpdate.delivery_format = anonymousData.deliveryFormat;
      if (anonymousData.idealClientTypes) profileUpdate.ideal_client_types = anonymousData.idealClientTypes;
      if (anonymousData.coachingStyle) profileUpdate.coaching_style = anonymousData.coachingStyle;
      if (anonymousData.philosophy) profileUpdate.philosophy = anonymousData.philosophy;
      if (anonymousData.howStarted) profileUpdate.how_started = anonymousData.howStarted;
      
      // Update the profile if we have data to update
      if (Object.keys(profileUpdate).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', userId);
          
        if (error) {
          throw new ServiceError('Failed to migrate anonymous data', error.message);
        }
      }
      
      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      console.error('Error migrating anonymous trainer data:', error);
      return ServiceResponseHelper.error(error);
    }
  }
}

export const TrainerService = TrainerServiceClass;
export { TrainerServiceClass };

