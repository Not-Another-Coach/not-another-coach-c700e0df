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
  // Trainer methods can be implemented here as needed
  // For now, using the data layer TrainerService
}

export const TrainerService = TrainerServiceClass;
export { TrainerServiceClass };
