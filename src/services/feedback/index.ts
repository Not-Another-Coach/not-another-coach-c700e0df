/**
 * Feedback Service
 * 
 * Handles feedback question management and ordering
 */

import { BaseService } from '../base/BaseService';
import { ServiceError } from '../base/ServiceError';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import type { ServiceResponse } from '../types';

export class FeedbackServiceClass extends BaseService {
  /**
   * Reorder feedback questions (admin only)
   */
  static async reorderFeedbackQuestions(
    questionIds: string[]
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.db.rpc('reorder_feedback_questions', {
        question_ids: questionIds
      });

      if (error) throw error;
      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get feedback questions
   */
  static async getFeedbackQuestions(): Promise<ServiceResponse<any[]>> {
    try {
      const result = await (this.db as any)
        .from('discovery_call_feedback_questions')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (result.error) throw result.error;
      return ServiceResponseHelper.success(result.data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Create feedback question (admin only)
   */
  static async createFeedbackQuestion(
    questionData: {
      question_text: string;
      question_type: string;
      audience: string;
      is_mandatory?: boolean;
      display_order?: number;
      options?: any;
    }
  ): Promise<ServiceResponse<any>> {
    return this.executeMutation(async () => {
      return await this.db
        .from('discovery_call_feedback_questions')
        .insert([questionData])
        .select()
        .single();
    });
  }

  /**
   * Update feedback question (admin only)
   */
  static async updateFeedbackQuestion(
    questionId: string,
    updates: Record<string, any>
  ): Promise<ServiceResponse<any>> {
    return this.executeMutation(async () => {
      return await this.db
        .from('discovery_call_feedback_questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single();
    });
  }

  /**
   * Delete feedback question (admin only)
   */
  static async deleteFeedbackQuestion(
    questionId: string
  ): Promise<ServiceResponse<void>> {
    return this.executeMutation(async () => {
      const result = await this.db
        .from('discovery_call_feedback_questions')
        .delete()
        .eq('id', questionId);
      
      return { data: null, error: result.error };
    });
  }
}

export const FeedbackService = FeedbackServiceClass;
