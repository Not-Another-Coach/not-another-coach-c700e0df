/**
 * Activity Service
 * 
 * Handles activity acknowledgment, recommendations, and template operations
 */

import { BaseService } from '../base/BaseService';
import { ServiceError } from '../base/ServiceError';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import type { ServiceResponse } from '../types';

export class ActivityServiceClass extends BaseService {
  /**
   * Acknowledge an activity
   */
  static async acknowledgeActivity(
    alertId: string,
    note?: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await this.db.rpc('acknowledge_activity', {
        p_alert_id: alertId,
        p_note: note || null
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data as boolean);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Check if activity is acknowledged
   */
  static async isActivityAcknowledged(
    alertId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await this.db.rpc('is_activity_acknowledged', {
        p_alert_id: alertId
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data as boolean);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get activity recommendations for template
   */
  static async getActivityRecommendations(
    trainerId: string,
    packageIds?: string[]
  ): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await this.db.rpc('get_activity_recommendations_for_template', {
        p_trainer_id: trainerId,
        p_package_ids: packageIds
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Evaluate conditional step
   */
  static async evaluateConditionalStep(
    stepId: string,
    templateId: string,
    clientId: string,
    clientData?: any
  ): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.db.rpc('evaluate_conditional_step', {
        p_step_id: stepId,
        p_template_id: templateId,
        p_client_id: clientId,
        p_client_data: clientData || null
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Create template version
   */
  static async createTemplateVersion(
    templateId: string,
    changelog?: string
  ): Promise<ServiceResponse<string>> {
    try {
      const { data, error } = await this.db.rpc('create_template_version', {
        p_template_id: templateId,
        p_changelog: changelog || null
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data as string);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }
}

export const ActivityService = ActivityServiceClass;
