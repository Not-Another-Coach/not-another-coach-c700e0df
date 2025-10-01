/**
 * Content Service
 * 
 * Handles content management including alerts, highlights,
 * and other dynamic content throughout the application
 */

import { supabase } from '@/integrations/supabase/client';
import { BaseService } from '../base/BaseService';
import { ServiceResponse } from '../types';
import type {
  Alert,
  CreateAlertRequest,
  HighlightContent,
  HighlightSubmission,
  CreateHighlightSubmissionRequest
} from './types';

class ContentServiceClass extends BaseService {
  /**
   * Get alerts for current user
   */
  async getAlerts(activeOnly: boolean = true): Promise<ServiceResponse<Alert[]>> {
    try {
      let query = supabase
        .from('alerts')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { success: true, data: (data || []) as any };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Create alert
   */
  async createAlert(request: CreateAlertRequest): Promise<ServiceResponse<Alert>> {
    return BaseService.executeMutation(async () => {
      const user = (await supabase.auth.getUser()).data.user;

      return await supabase
        .from('alerts')
        .insert({
          ...request,
          created_by: user?.id,
          priority: request.priority || 1
        })
        .select()
        .single();
    });
  }

  /**
   * Update alert
   */
  async updateAlert(
    alertId: string,
    updates: Partial<Alert>
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update(updates)
        .eq('id', alertId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(
    alertId: string,
    note?: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase.rpc('acknowledge_activity', {
        p_alert_id: alertId,
        p_note: note
      });

      if (error) throw error;
      return { success: true, data: data as boolean };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Check if alert is acknowledged
   */
  async isAlertAcknowledged(alertId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase.rpc('is_activity_acknowledged', {
        p_alert_id: alertId
      });

      if (error) throw error;
      return { success: true, data: data as boolean };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Get highlight content
   */
  async getHighlightContent(): Promise<ServiceResponse<HighlightContent[]>> {
    return BaseService.executeListQuery(async () => {
      return await supabase
        .from('highlights_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
    });
  }

  /**
   * Get highlight submissions for trainer
   */
  async getHighlightSubmissions(): Promise<ServiceResponse<HighlightSubmission[]>> {
    return BaseService.executeListQuery(async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      return await supabase
        .from('highlights_submissions')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });
    });
  }

  /**
   * Create highlight submission
   */
  async createHighlightSubmission(
    request: CreateHighlightSubmissionRequest
  ): Promise<ServiceResponse<HighlightSubmission>> {
    return BaseService.executeMutation(async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      return await supabase
        .from('highlights_submissions')
        .insert({
          trainer_id: user.id,
          content_id: request.content_id,
          status: 'pending'
        })
        .select()
        .single();
    });
  }

  /**
   * Review highlight submission (admin only)
   */
  async reviewHighlightSubmission(
    submissionId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ): Promise<ServiceResponse<void>> {
    try {
      const user = (await supabase.auth.getUser()).data.user;

      const { error } = await supabase
        .from('highlights_submissions')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }

  /**
   * Track highlight interaction
   */
  async trackHighlightInteraction(
    highlightId: string,
    interactionType: 'view' | 'like' | 'trainer_visited'
  ): Promise<ServiceResponse<void>> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        return { success: true }; // Silently skip if not authenticated
      }

      const { error } = await supabase
        .from('user_highlight_interactions')
        .insert({
          user_id: user.id,
          highlight_id: highlightId,
          interaction_type: interactionType
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
  }
}

export const ContentService = new ContentServiceClass();
export { ContentServiceClass };
