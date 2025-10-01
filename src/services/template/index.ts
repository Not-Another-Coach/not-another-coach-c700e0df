/**
 * Template Service
 * 
 * Handles onboarding templates, assignments, and client progress tracking.
 */

import { supabase } from '@/integrations/supabase/client';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import type { ServiceResponse } from '../types';
import type {
  OnboardingTemplate,
  TemplateSection,
  ClientTemplateAssignment,
  ClientOnboardingProgress,
  TemplatePackageLink,
  CreateTemplateInput,
  UpdateTemplateInput,
  AssignTemplateInput,
  UpdateProgressInput,
} from './types';

export const TemplateService = {
  /**
   * Get all templates for a trainer
   */
  async getTemplates(trainerId: string): Promise<ServiceResponse<OnboardingTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from('trainer_onboarding_templates')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('display_order');

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to fetch templates', error)
        );
      }

      return ServiceResponseHelper.success((data || []) as OnboardingTemplate[]);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Get a single template by ID
   */
  async getTemplate(
    templateId: string,
    trainerId: string
  ): Promise<ServiceResponse<OnboardingTemplate>> {
    try {
      const { data, error } = await supabase
        .from('trainer_onboarding_templates')
        .select('*')
        .eq('id', templateId)
        .eq('trainer_id', trainerId)
        .single();

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to fetch template', error)
        );
      }

      if (!data) {
        return ServiceResponseHelper.error(
          ServiceError.notFound('Template')
        );
      }

      return ServiceResponseHelper.success(data as OnboardingTemplate);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Create a new template
   */
  async createTemplate(
    trainerId: string,
    input: CreateTemplateInput
  ): Promise<ServiceResponse<OnboardingTemplate>> {
    try {
      const { data, error } = await supabase
        .from('trainer_onboarding_templates')
        .insert({
          trainer_id: trainerId,
          ...input,
          status: input.status || 'draft',
        })
        .select()
        .single();

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to create template', error)
        );
      }

      return ServiceResponseHelper.success(data as OnboardingTemplate);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Update a template
   */
  async updateTemplate(
    templateId: string,
    trainerId: string,
    updates: UpdateTemplateInput
  ): Promise<ServiceResponse<OnboardingTemplate>> {
    try {
      const { data, error } = await supabase
        .from('trainer_onboarding_templates')
        .update(updates)
        .eq('id', templateId)
        .eq('trainer_id', trainerId)
        .select()
        .single();

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to update template', error)
        );
      }

      return ServiceResponseHelper.success(data as OnboardingTemplate);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Delete a template
   */
  async deleteTemplate(
    templateId: string,
    trainerId: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('trainer_onboarding_templates')
        .delete()
        .eq('id', templateId)
        .eq('trainer_id', trainerId);

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to delete template', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Duplicate a template
   */
  async duplicateTemplate(
    templateId: string,
    trainerId: string,
    newName?: string
  ): Promise<ServiceResponse<OnboardingTemplate>> {
    try {
      // Get original template
      const { data: original, error: fetchError } = await supabase
        .from('trainer_onboarding_templates')
        .select('*')
        .eq('id', templateId)
        .eq('trainer_id', trainerId)
        .single();

      if (fetchError || !original) {
        return ServiceResponseHelper.error(
          ServiceError.notFound('Template')
        );
      }

      // Create duplicate
      const { data, error: insertError } = await supabase
        .from('trainer_onboarding_templates')
        .insert({
          trainer_id: trainerId,
          step_name: newName || `${original.step_name} (Copy)`,
          step_type: original.step_type,
          description: original.description,
          instructions: original.instructions,
          requires_file_upload: original.requires_file_upload,
          completion_method: original.completion_method,
          display_order: original.display_order + 1,
          is_active: false,
          status: 'draft',
          created_from_template_id: templateId,
        })
        .select()
        .single();

      if (insertError) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to duplicate template', insertError)
        );
      }

      return ServiceResponseHelper.success(data as OnboardingTemplate);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Reorder templates
   */
  async reorderTemplates(
    trainerId: string,
    templateOrders: Array<{ id: string; display_order: number }>
  ): Promise<ServiceResponse<void>> {
    try {
      for (const { id, display_order } of templateOrders) {
        const { error } = await supabase
          .from('trainer_onboarding_templates')
          .update({ display_order })
          .eq('id', id)
          .eq('trainer_id', trainerId);

        if (error) throw error;
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Get client template assignments
   */
  async getClientAssignments(
    clientId: string
  ): Promise<ServiceResponse<ClientTemplateAssignment[]>> {
    try {
      const { data, error } = await supabase
        .from('client_template_assignments')
        .select('*')
        .eq('client_id', clientId)
        .order('assigned_at', { ascending: false });

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to fetch assignments', error)
        );
      }

      return ServiceResponseHelper.success((data || []) as ClientTemplateAssignment[]);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Get trainer's client assignments
   */
  async getTrainerAssignments(
    trainerId: string
  ): Promise<ServiceResponse<ClientTemplateAssignment[]>> {
    try {
      const { data, error } = await supabase
        .from('client_template_assignments')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('assigned_at', { ascending: false });

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to fetch assignments', error)
        );
      }

      return ServiceResponseHelper.success((data || []) as ClientTemplateAssignment[]);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Assign template to client
   */
  async assignTemplate(
    trainerId: string,
    input: AssignTemplateInput
  ): Promise<ServiceResponse<ClientTemplateAssignment>> {
    try {
      const { data, error } = await supabase
        .from('client_template_assignments')
        .insert({
          trainer_id: trainerId,
          client_id: input.client_id,
          template_name: input.template_name,
          template_base_id: input.template_base_id,
          assignment_notes: input.assignment_notes,
          status: 'active',
          correlation_id: crypto.randomUUID(),
        })
        .select()
        .single();

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to assign template', error)
        );
      }

      return ServiceResponseHelper.success(data as ClientTemplateAssignment);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Get client onboarding progress
   */
  async getClientProgress(
    clientId: string,
    trainerId?: string
  ): Promise<ServiceResponse<ClientOnboardingProgress[]>> {
    try {
      let query = supabase
        .from('client_onboarding_progress')
        .select('*')
        .eq('client_id', clientId)
        .order('display_order');

      if (trainerId) {
        query = query.eq('trainer_id', trainerId);
      }

      const { data, error } = await query;

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to fetch progress', error)
        );
      }

      return ServiceResponseHelper.success((data || []) as ClientOnboardingProgress[]);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Update client progress step
   */
  async updateProgress(
    progressId: string,
    updates: UpdateProgressInput
  ): Promise<ServiceResponse<ClientOnboardingProgress>> {
    try {
      const { data, error } = await supabase
        .from('client_onboarding_progress')
        .update(updates)
        .eq('id', progressId)
        .select()
        .single();

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to update progress', error)
        );
      }

      return ServiceResponseHelper.success(data as ClientOnboardingProgress);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Create onboarding progress steps from templates
   */
  async createProgressSteps(
    clientId: string,
    trainerId: string,
    assignmentId: string,
    steps: Array<Omit<ClientOnboardingProgress, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<ServiceResponse<ClientOnboardingProgress[]>> {
    try {
      const { data, error } = await supabase
        .from('client_onboarding_progress')
        .insert(
          steps.map(step => ({
            ...step,
            client_id: clientId,
            trainer_id: trainerId,
            assignment_id: assignmentId,
          })) as any
        )
        .select();

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to create progress steps', error)
        );
      }

      return ServiceResponseHelper.success((data || []) as ClientOnboardingProgress[]);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Create single progress record (for direct assignment)
   */
  async createProgressRecord(
    clientId: string,
    trainerId: string,
    progressRecord: Omit<ClientOnboardingProgress, 'id' | 'client_id' | 'trainer_id' | 'created_at' | 'updated_at'>
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('client_onboarding_progress')
        .insert([{
          ...progressRecord,
          client_id: clientId,
          trainer_id: trainerId,
        } as any]);

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to create progress record', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Get template sections (getting started, first week, ongoing support, commitments)
   */
  async getTemplateSections(
    templateId: string
  ): Promise<ServiceResponse<{
    gettingStarted: any[];
    firstWeek: any[];
    ongoingSupport: any[];
    commitments: any[];
  }>> {
    try {
      const [gettingStartedRes, firstWeekRes, ongoingSupportRes, commitmentsRes] = await Promise.all([
        supabase.from('onboarding_getting_started').select('*').eq('template_id', templateId).order('display_order'),
        supabase.from('onboarding_first_week').select('*').eq('template_id', templateId).order('display_order'),
        supabase.from('onboarding_ongoing_support').select('*').eq('template_id', templateId),
        supabase.from('onboarding_commitments').select('*').eq('template_id', templateId).order('display_order')
      ]);

      if (gettingStartedRes.error) throw gettingStartedRes.error;
      if (firstWeekRes.error) throw firstWeekRes.error;
      if (ongoingSupportRes.error) throw ongoingSupportRes.error;
      if (commitmentsRes.error) throw commitmentsRes.error;

      return ServiceResponseHelper.success({
        gettingStarted: gettingStartedRes.data || [],
        firstWeek: firstWeekRes.data || [],
        ongoingSupport: ongoingSupportRes.data || [],
        commitments: commitmentsRes.data || []
      });
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Get template-package links
   */
  async getPackageLinks(
    templateIds: string[]
  ): Promise<ServiceResponse<TemplatePackageLink[]>> {
    try {
      const { data, error } = await supabase
        .from('template_package_links')
        .select('*')
        .in('template_id', templateIds);

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to fetch package links', error)
        );
      }

      return ServiceResponseHelper.success(data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Link template to package
   */
  async linkToPackage(
    templateId: string,
    packageId: string,
    packageName: string,
    autoAssign: boolean = true
  ): Promise<ServiceResponse<TemplatePackageLink>> {
    try {
      const { data, error } = await supabase
        .from('template_package_links')
        .insert({
          template_id: templateId,
          package_id: packageId,
          package_name: packageName,
          auto_assign: autoAssign,
        })
        .select()
        .single();

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to link template to package', error)
        );
      }

      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Unlink template from package
   */
  async unlinkFromPackage(
    templateId: string,
    packageId: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('template_package_links')
        .delete()
        .eq('template_id', templateId)
        .eq('package_id', packageId);

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to unlink template from package', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Remove assignment
   */
  async removeAssignment(
    assignmentId: string,
    removedBy: string,
    removalReason?: string
  ): Promise<ServiceResponse<void>> {
    try {
      // Delete associated progress records
      const { error: progressError } = await supabase
        .from('client_onboarding_progress')
        .delete()
        .eq('assignment_id', assignmentId);

      if (progressError) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to delete progress records', progressError)
        );
      }

      // Update assignment status
      const { error } = await supabase
        .from('client_template_assignments')
        .update({
          status: 'removed',
          removed_at: new Date().toISOString(),
          removed_by: removedBy,
          removal_reason: removalReason,
        })
        .eq('id', assignmentId);

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to remove assignment', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },
};
