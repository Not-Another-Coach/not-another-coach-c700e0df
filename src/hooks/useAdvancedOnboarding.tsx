import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadService } from '@/services';
import { toast } from 'sonner';

// Types for advanced features
export interface ActivityAssignment {
  id: string;
  template_id: string;
  section_type: 'getting_started' | 'ongoing_support' | 'commitments' | 'trainer_notes';
  section_item_id: string;
  activity_id: string;
  assignment_order: number;
  is_required: boolean;
  custom_instructions?: string;
  estimated_duration_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateAuditLog {
  id: string;
  template_id: string;
  action_type: 'published' | 'unpublished' | 'locked' | 'unlocked' | 'version_created' | 'structural_change';
  action_by: string;
  action_details: Record<string, any>;
  action_reason?: string;
  version_number?: number;
  created_at: string;
}

export interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
}

export function useAdvancedOnboarding() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityAssignments, setActivityAssignments] = useState<ActivityAssignment[]>([]);
  const [auditLogs, setAuditLogs] = useState<TemplateAuditLog[]>([]);

  // Activity Assignment Functions
  const fetchActivityAssignments = useCallback(async (templateId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_activity_assignments')
        .select('*')
        .eq('template_id', templateId)
        .order('assignment_order');

      if (error) throw error;
      setActivityAssignments((data || []).map(item => ({
        ...item,
        section_type: item.section_type as 'getting_started' | 'ongoing_support' | 'commitments' | 'trainer_notes'
      })));
    } catch (err) {
      console.error('Error fetching activity assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity assignments');
    }
  }, [user]);

  const assignActivityToSection = useCallback(async (
    templateId: string,
    sectionType: string,
    sectionItemId: string,
    activityId: string,
    isRequired: boolean = true,
    customInstructions?: string
  ) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_activity_assignments')
        .insert({
          template_id: templateId,
          section_type: sectionType,
          section_item_id: sectionItemId,
          activity_id: activityId,
          is_required: isRequired,
          custom_instructions: customInstructions,
          assignment_order: activityAssignments.length
        });

      if (error) throw error;
      await fetchActivityAssignments(templateId);
      toast.success('Activity assigned successfully');
    } catch (err) {
      console.error('Error assigning activity:', err);
      throw err;
    }
  }, [user, activityAssignments.length, fetchActivityAssignments]);

  const removeActivityAssignment = useCallback(async (assignmentId: string, templateId: string) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_activity_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      await fetchActivityAssignments(templateId);
      toast.success('Activity assignment removed');
    } catch (err) {
      console.error('Error removing activity assignment:', err);
      throw err;
    }
  }, [user, fetchActivityAssignments]);

  const reorderActivityAssignments = useCallback(async (assignments: ActivityAssignment[]) => {
    if (!user) throw new Error('No user');

    try {
      const updates = assignments.map((assignment, index) => ({
        id: assignment.id,
        assignment_order: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('onboarding_activity_assignments')
          .update({ assignment_order: update.assignment_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      setActivityAssignments(assignments);
      toast.success('Activity assignments reordered');
    } catch (err) {
      console.error('Error reordering assignments:', err);
      throw err;
    }
  }, [user]);

  // Publishing Workflow Functions
  const publishTemplate = useCallback(async (templateId: string) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('trainer_onboarding_templates')
        .update({
          published_at: new Date().toISOString(),
          is_locked: true,
          lock_reason: 'Template locked after publishing to prevent structural changes'
        })
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Template published and locked successfully');
    } catch (err) {
      console.error('Error publishing template:', err);
      throw err;
    }
  }, [user]);

  const unpublishTemplate = useCallback(async (templateId: string, reason?: string) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('trainer_onboarding_templates')
        .update({
          published_at: null,
          is_locked: false,
          lock_reason: null
        })
        .eq('id', templateId);

      if (error) throw error;

      // Create audit log entry
      await supabase
        .from('onboarding_template_audit_log')
        .insert({
          template_id: templateId,
          action_type: 'unpublished',
          action_by: user.id,
          action_reason: reason
        });

      toast.success('Template unpublished successfully');
    } catch (err) {
      console.error('Error unpublishing template:', err);
      throw err;
    }
  }, [user]);

  const fetchAuditLog = useCallback(async (templateId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_template_audit_log')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuditLogs((data || []).map(item => ({
        ...item,
        action_type: item.action_type as 'published' | 'unpublished' | 'locked' | 'unlocked' | 'version_created' | 'structural_change',
        action_details: item.action_details as Record<string, any>
      })));
    } catch (err) {
      console.error('Error fetching audit log:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audit log');
    }
  }, [user]);

  // File Upload Functions
  const uploadAttachment = useCallback(async (
    templateId: string,
    file: File,
    folder: string = 'general'
  ): Promise<string> => {
    if (!user) throw new Error('No user');

    try {
      const fileName = `${user.id}/${templateId}/${folder}/${Date.now()}-${file.name}`;
      
      const uploadResult = await FileUploadService.uploadFile(
        'onboarding-public',
        fileName,
        file
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error?.message || 'Upload failed');
      }

      return uploadResult.data.publicUrl;
    } catch (err) {
      console.error('Error uploading attachment:', err);
      throw err;
    }
  }, [user]);

  const deleteAttachment = useCallback(async (filePath: string) => {
    if (!user) throw new Error('No user');

    try {
      const deleteResult = await FileUploadService.deleteFile('onboarding-public', filePath);

      if (!deleteResult.success) {
        throw new Error(deleteResult.error?.message || 'Delete failed');
      }
      toast.success('Attachment deleted successfully');
    } catch (err) {
      console.error('Error deleting attachment:', err);
      throw err;
    }
  }, [user]);

  // Visibility Matrix Functions
  const updateSectionVisibility = useCallback(async (
    sectionType: string,
    sectionId: string,
    visibility: {
      visibility_client?: boolean;
      visibility_trainer?: boolean;
      show_in_summary?: boolean;
    }
  ) => {
    if (!user) throw new Error('No user');

    try {
      // Map section type to table name
      const tableMap = {
        getting_started: 'onboarding_getting_started',
        ongoing_support: 'onboarding_ongoing_support',
        commitments: 'onboarding_commitments',
        trainer_notes: 'onboarding_trainer_notes'
      };
      
      const tableName = tableMap[sectionType as keyof typeof tableMap];
      if (!tableName) {
        throw new Error(`Invalid section type: ${sectionType}`);
      }

      const { error } = await supabase
        .from(tableName as any)
        .update(visibility)
        .eq('id', sectionId);

      if (error) throw error;
      toast.success('Visibility settings updated');
    } catch (err) {
      console.error('Error updating visibility:', err);
      throw err;
    }
  }, [user]);

  return {
    // State
    loading,
    error,
    activityAssignments,
    auditLogs,

    // Activity Assignment Functions
    fetchActivityAssignments,
    assignActivityToSection,
    removeActivityAssignment,
    reorderActivityAssignments,

    // Publishing Workflow Functions
    publishTemplate,
    unpublishTemplate,
    fetchAuditLog,

    // File Upload Functions
    uploadAttachment,
    deleteAttachment,

    // Visibility Matrix Functions
    updateSectionVisibility
  };
}