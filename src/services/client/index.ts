/**
 * Client Service
 * 
 * Handles client-specific operations including profile management,
 * journey tracking, and trainer interactions.
 */

import { supabase } from '@/integrations/supabase/client';
import { BaseService } from '../base/BaseService';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import type { ServiceResponse } from '../types';

export interface ClientProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  user_type: string;
  client_journey_stage?: string;
  primary_goals?: string[];
  training_location_preference?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientJourneyStage {
  stage: string;
  progress: number;
  nextSteps: string[];
}

class ClientServiceClass extends BaseService {
  /**
   * Get client profile by ID
   */
  static async getClientProfile(clientId: string): Promise<ServiceResponse<ClientProfile>> {
    if (!clientId) {
      return ServiceResponseHelper.error(
        ServiceError.validation('Client ID is required')
      );
    }

    return this.executeQuery(async () => {
      return await this.db
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .eq('user_type', 'client')
        .single();
    });
  }

  /**
   * Get current client's profile
   */
  static async getCurrentClientProfile(): Promise<ServiceResponse<ClientProfile>> {
    const userIdResponse = await this.getCurrentUserId();
    if (!userIdResponse.success || !userIdResponse.data) {
      return ServiceResponseHelper.error(userIdResponse.error!);
    }

    return this.getClientProfile(userIdResponse.data);
  }

  /**
   * Update client profile
   */
  static async updateClientProfile(
    clientId: string,
    updates: Record<string, any>
  ): Promise<ServiceResponse<any>> {
    if (!clientId) {
      return ServiceResponseHelper.error(
        ServiceError.validation('Client ID is required')
      );
    }

    return this.executeMutation(async () => {
      return await this.db
        .from('profiles')
        .update(updates)
        .eq('id', clientId)
        .eq('user_type', 'client')
        .select()
        .single();
    });
  }

  /**
   * Get client journey stage (RPC wrapper)
   */
  static async getClientJourneyStage(clientId: string): Promise<ServiceResponse<string>> {
    try {
      const { data, error } = await this.db.rpc('get_client_journey_stage', {
        p_client_id: clientId
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data as string);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get clients for a trainer
   */
  static async getTrainerClients(
    trainerId: string,
    stages?: string[]
  ): Promise<ServiceResponse<any[]>> {
    return this.executeListQuery(async () => {
      let query = this.db
        .from('client_trainer_engagement')
        .select(`
          client_id,
          stage,
          profiles!client_trainer_engagement_client_id_fkey(*)
        `)
        .eq('trainer_id', trainerId);

      if (stages && stages.length > 0) {
        query = query.in('stage', stages as any);
      }

      const result = await query;
      
      // Transform the data to extract profiles
      if (result.data) {
        return {
          data: result.data.map((item: any) => item.profiles).filter(Boolean),
          error: null
        };
      }
      
      return result;
    });
  }

  /**
   * Get active clients for trainer
   */
  static async getActiveClients(trainerId?: string): Promise<ServiceResponse<any[]>> {
    const effectiveTrainerId = trainerId || (await this.getCurrentUserId()).data;
    
    if (!effectiveTrainerId) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated')
      );
    }

    try {
      const result = await (supabase as any)
        .from('v_clients')
        .select('*')
        .eq('trainer_id', effectiveTrainerId);
      
      if (result.error) throw result.error;
      return ServiceResponseHelper.success(result.data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Check if client has sent first message to trainer
   */
  static async hasClientSentFirstMessage(
    conversationId: string,
    clientId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await this.db.rpc('client_has_sent_first_message', {
        conversation_uuid: conversationId,
        client_uuid: clientId
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data as boolean);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get client details with engagement data
   */
  static async getClientDetails(clientId: string): Promise<ServiceResponse<any>> {
    return this.executeQuery(async () => {
      return await this.db
        .from('v_clients')
        .select('*')
        .eq('id', clientId)
        .single();
    });
  }
}

export const ClientService = ClientServiceClass;
export { ClientServiceClass };
