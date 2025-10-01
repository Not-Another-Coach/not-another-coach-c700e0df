/**
 * Engagement Service
 * 
 * Handles all client-trainer engagement operations including:
 * - Engagement stage management
 * - Prospect and client data aggregation
 * - Engagement tracking and updates
 */

import { BaseService } from '../base/BaseService';
import { ServiceError } from '../base/ServiceError';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import type { ServiceResponse } from '../types';

export interface EngagementData {
  id: string;
  client_id: string;
  trainer_id: string;
  stage: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  became_client_at?: string;
  discovery_completed_at?: string;
  matched_at?: string;
  liked_at?: string;
}

export interface ProspectSummary {
  totalActive: number;
  totalProspects: number;
  totalCompleted: number;
  totalInactive: number;
  clients: any[];
}

export class EngagementService extends BaseService {
  /**
   * Get engagement stage between client and trainer
   */
  static async getEngagementStage(
    trainerId: string,
    clientId?: string
  ): Promise<ServiceResponse<EngagementData | null>> {
    const effectiveClientId = clientId || (await this.getCurrentUserId()).data;
    
    if (!effectiveClientId) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated.')
      );
    }

    return this.executeMaybeQuery(async () => {
      return await this.db
        .from('client_trainer_engagement')
        .select('*')
        .eq('client_id', effectiveClientId)
        .eq('trainer_id', trainerId)
        .single();
    });
  }

  /**
   * Update engagement stage
   */
  static async updateEngagementStage(
    trainerId: string,
    newStage: any,
    clientId?: string
  ): Promise<ServiceResponse<EngagementData>> {
    const effectiveClientId = clientId || (await this.getCurrentUserId()).data;
    
    if (!effectiveClientId) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated.')
      );
    }

    // Check if engagement exists
    const existingResponse = await this.getEngagementStage(trainerId, effectiveClientId);
    
    if (existingResponse.data) {
      // Update existing
      return this.executeMutation(async () => {
        return await this.db
          .from('client_trainer_engagement')
          .update({ stage: newStage as any, updated_at: new Date().toISOString() })
          .eq('client_id', effectiveClientId)
          .eq('trainer_id', trainerId)
          .select()
          .single();
      });
    } else {
      // Create new
      return this.executeMutation(async () => {
        return await this.db
          .from('client_trainer_engagement')
          .insert([{
            client_id: effectiveClientId,
            trainer_id: trainerId,
            stage: newStage as any
          }])
          .select()
          .single();
      });
    }
  }

  /**
   * Get all engagements for a trainer
   */
  static async getTrainerEngagements(
    trainerId?: string,
    stages?: any[]
  ): Promise<ServiceResponse<EngagementData[]>> {
    const effectiveTrainerId = trainerId || (await this.getCurrentUserId()).data;
    
    if (!effectiveTrainerId) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated.')
      );
    }

    return this.executeListQuery(async () => {
      let query = this.db
        .from('client_trainer_engagement')
        .select('*')
        .eq('trainer_id', effectiveTrainerId);

      if (stages && stages.length > 0) {
        query = query.in('stage', stages as any);
      }

      return await query;
    });
  }

  /**
   * Get all engagements for a client
   */
  static async getClientEngagements(
    clientId?: string
  ): Promise<ServiceResponse<EngagementData[]>> {
    const effectiveClientId = clientId || (await this.getCurrentUserId()).data;
    
    if (!effectiveClientId) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated.')
      );
    }

    return this.executeListQuery(async () => {
      return await this.db
        .from('client_trainer_engagement')
        .select('*')
        .eq('client_id', effectiveClientId);
    });
  }

  /**
   * Get prospect summary for trainer dashboard
   */
  static async getProspectSummary(trainerId?: string): Promise<ServiceResponse<ProspectSummary>> {
    const effectiveTrainerId = trainerId || (await this.getCurrentUserId()).data;
    
    if (!effectiveTrainerId) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated.')
      );
    }

    try {
      // Get all engagement data
      const engagementsResponse = await this.getTrainerEngagements(
        effectiveTrainerId,
        ['active_client', 'shortlisted', 'getting_to_know_your_coach', 'discovery_in_progress', 'matched', 'discovery_completed', 'declined', 'unmatched']
      );

      if (!engagementsResponse.success || !engagementsResponse.data) {
        return ServiceResponseHelper.error(
          engagementsResponse.error || ServiceError.database('Failed to fetch engagements')
        );
      }

      const engagements = engagementsResponse.data;

      if (engagements.length === 0) {
        return ServiceResponseHelper.success({
          totalActive: 0,
          totalProspects: 0,
          totalCompleted: 0,
          totalInactive: 0,
          clients: []
        });
      }

      // Get client profiles
      const clientIds = engagements.map(e => e.client_id);
      const profilesResponse = await this.executeListQuery(async () => {
        return await this.db
          .from('v_clients')
          .select('id, first_name, last_name, primary_goals, training_location_preference')
          .in('id', clientIds);
      });

      // Get selection requests
      const selectionsResponse = await this.executeListQuery(async () => {
        return await this.db
          .from('coach_selection_requests')
          .select('client_id, package_name, package_price, status')
          .eq('trainer_id', effectiveTrainerId)
          .in('client_id', clientIds);
      });

      // Get discovery calls
      const callsResponse = await this.executeListQuery(async () => {
        return await this.db
          .from('discovery_calls')
          .select('client_id, scheduled_for, status')
          .eq('trainer_id', effectiveTrainerId)
          .in('client_id', clientIds);
      });

      const profiles = profilesResponse.data || [];
      const selections = selectionsResponse.data || [];
      const discoveryCalls = callsResponse.data || [];

      // Merge all data into client records
      const clientRecords = engagements.map(engagement => {
        const profile = profiles.find(p => p.id === engagement.client_id);
        const selection = selections.find(s => s.client_id === engagement.client_id);
        const discovery = discoveryCalls.find(d => d.client_id === engagement.client_id);

        // Determine status based on stage
        let status = 'prospect';
        if (engagement.stage === 'active_client') {
          status = 'active';
        } else if (engagement.stage === 'declined' || engagement.stage === 'unmatched') {
          status = 'inactive';
        }

        return {
          id: `${engagement.client_id}-${engagement.trainer_id}`,
          client_id: engagement.client_id,
          name: profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : `Client ${engagement.client_id.slice(0, 8)}`,
          status,
          stage: engagement.stage,
          primary_goals: profile?.primary_goals || [],
          program_package: selection?.package_name,
          start_date: engagement.became_client_at || engagement.created_at,
          location_preference: profile?.training_location_preference,
          prospect_source: 'Platform',
          last_activity: engagement.updated_at,
          notes: engagement.notes,
          selection_request: selection ? {
            package_name: selection.package_name,
            package_price: selection.package_price,
            status: selection.status
          } : undefined,
          discovery_call: discovery ? {
            scheduled_for: discovery.scheduled_for,
            status: discovery.status
          } : undefined
        };
      });

      const summary: ProspectSummary = {
        totalActive: clientRecords.filter(c => c.status === 'active').length,
        totalProspects: clientRecords.filter(c => c.status === 'prospect').length,
        totalCompleted: clientRecords.filter(c => c.status === 'completed').length,
        totalInactive: clientRecords.filter(c => c.status === 'inactive').length,
        clients: clientRecords
      };

      return ServiceResponseHelper.success(summary);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Check if engagement exists
   */
  static async engagementExists(
    trainerId: string,
    clientId?: string
  ): Promise<ServiceResponse<boolean>> {
    const response = await this.getEngagementStage(trainerId, clientId);
    return ServiceResponseHelper.success(!!response.data);
  }

  /**
   * Update engagement stage via RPC (legacy support)
   * Prefer using updateEngagementStage() for new code
   */
  static async updateEngagementStageRPC(
    clientId: string,
    trainerId: string,
    newStage: string
  ): Promise<ServiceResponse<void>> {
    // Use the main updateEngagementStage method instead
    const response = await this.updateEngagementStage(trainerId, newStage as any, clientId);
    
    if (!response.success) {
      return ServiceResponseHelper.error(response.error!);
    }
    
    return ServiceResponseHelper.success(undefined);
  }

  /**
   * Complete coach selection payment
   */
  static async completeCoachSelectionPayment(
    clientId: string,
    trainerId: string,
    paymentIntentId?: string,
    paymentMethod?: string
  ): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.db.rpc('complete_coach_selection_payment', {
        p_client_id: clientId,
        p_trainer_id: trainerId,
        p_stripe_payment_intent_id: paymentIntentId,
        p_payment_method: paymentMethod
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Create coach selection request via RPC
   */
  static async createCoachSelectionRequest(
    trainerId: string,
    packageId: string,
    packageName: string,
    packagePrice: number,
    packageDuration: string,
    clientMessage?: string
  ): Promise<ServiceResponse<string>> {
    try {
      const { data, error } = await this.db.rpc('create_coach_selection_request', {
        p_trainer_id: trainerId,
        p_package_id: packageId,
        p_package_name: packageName,
        p_package_price: packagePrice,
        p_package_duration: packageDuration,
        p_client_message: clientMessage
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data as string);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }
}
