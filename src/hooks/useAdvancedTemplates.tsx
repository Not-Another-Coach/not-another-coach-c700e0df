import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ConditionalRule {
  step_id: string;
  condition_type: 'package_type' | 'previous_answer' | 'step_completed';
  field_name?: string;
  expected_value: any;
  dependency_step_id?: string;
  operator: 'AND' | 'OR';
}

interface TemplateAnalytics {
  id: string;
  template_id: string;
  metric_type: string;
  metric_value: number;
  metric_data: any;
  date_recorded: string;
  created_at: string;
  updated_at: string;
  trainer_id: string;
}

interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  template_data: any;
  changelog?: string;
  created_by: string;
  created_at: string;
  is_current: boolean;
}

interface BulkOperation {
  id: string;
  operation_type: string;
  template_id: string;
  target_clients: string[];
  operation_data: any;
  status: string;
  progress_count: number;
  total_count: number;
  error_log?: string[];
  trainer_id: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  started_at?: string;
}

export function useAdvancedTemplates() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<TemplateAnalytics[]>([]);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch template analytics
  const fetchAnalytics = async (templateId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('onboarding_template_analytics')
        .select('*')
        .eq('trainer_id', user.id)
        .order('date_recorded', { ascending: false });

      if (templateId) {
        query = query.eq('template_id', templateId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAnalytics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    }
  };

  // Fetch template versions
  const fetchVersions = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('onboarding_template_versions')
        .select('*')
        .eq('template_id', templateId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch versions');
    }
  };

  // Fetch bulk operations
  const fetchBulkOperations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_bulk_operations')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBulkOperations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bulk operations');
    }
  };

  // Add conditional logic to template
  const addConditionalRule = async (templateId: string, rule: ConditionalRule) => {
    try {
      // Get current template
      const { data: template, error: fetchError } = await supabase
        .from('onboarding_templates')
        .select('conditional_logic')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      const currentLogic = (typeof template.conditional_logic === 'object' && template.conditional_logic !== null) 
        ? template.conditional_logic as any 
        : { rules: [], dependencies: {} };
      const updatedRules = [...(currentLogic.rules || []), rule];

      const { error } = await supabase
        .from('onboarding_templates')
        .update({ 
          conditional_logic: { ...currentLogic, rules: updatedRules } as any
        })
        .eq('id', templateId);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add conditional rule');
      return false;
    }
  };

  // Evaluate conditional step
  const evaluateConditionalStep = async (
    templateId: string, 
    clientId: string, 
    stepId: string, 
    clientData: any = {}
  ) => {
    try {
      const { data, error } = await supabase.rpc('evaluate_conditional_step', {
        p_template_id: templateId,
        p_client_id: clientId,
        p_step_id: stepId,
        p_client_data: clientData
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate conditional step');
      return true; // Default to visible on error
    }
  };

  // Create template version
  const createVersion = async (templateId: string, changelog?: string) => {
    try {
      const { data, error } = await supabase.rpc('create_template_version', {
        p_template_id: templateId,
        p_changelog: changelog
      });

      if (error) throw error;
      await fetchVersions(templateId);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create version');
      return null;
    }
  };

  // Revert to template version
  const revertToVersion = async (templateId: string, versionId: string) => {
    try {
      // Get version data
      const { data: version, error: versionError } = await supabase
        .from('onboarding_template_versions')
        .select('template_data')
        .eq('id', versionId)
        .single();

      if (versionError) throw versionError;

      // Update template with version data
      const { error } = await supabase
        .from('onboarding_templates')
        .update(version.template_data as any)
        .eq('id', templateId);

      if (error) throw error;

      // Mark this version as current
      await supabase
        .from('onboarding_template_versions')
        .update({ is_current: false })
        .eq('template_id', templateId);

      await supabase
        .from('onboarding_template_versions')
        .update({ is_current: true })
        .eq('id', versionId);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revert to version');
      return false;
    }
  };

  // Create bulk operation
  const createBulkOperation = async (
    operationType: string,
    templateId: string,
    targetClients: string[],
    operationData: any = {}
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('onboarding_bulk_operations')
        .insert({
          operation_type: operationType,
          template_id: templateId,
          trainer_id: user.id,
          target_clients: targetClients,
          operation_data: operationData,
          total_count: targetClients.length
        })
        .select()
        .single();

      if (error) throw error;
      await fetchBulkOperations();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bulk operation');
      return null;
    }
  };

  // Get analytics summary
  const getAnalyticsSummary = (templateId: string) => {
    const templateAnalytics = analytics.filter(a => a.template_id === templateId);
    
    return {
      totalUsage: templateAnalytics
        .filter(a => a.metric_type === 'usage')
        .reduce((sum, a) => sum + a.metric_value, 0),
      totalAssignments: templateAnalytics
        .filter(a => a.metric_type === 'assignment')
        .reduce((sum, a) => sum + a.metric_value, 0),
      totalCompletions: templateAnalytics
        .filter(a => a.metric_type === 'step_completion')
        .reduce((sum, a) => sum + a.metric_value, 0),
      completionRate: templateAnalytics.length > 0 ? 
        (templateAnalytics.filter(a => a.metric_type === 'step_completion').reduce((sum, a) => sum + a.metric_value, 0) /
         Math.max(1, templateAnalytics.filter(a => a.metric_type === 'assignment').reduce((sum, a) => sum + a.metric_value, 0))) * 100 : 0
    };
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchAnalytics(),
          fetchBulkOperations()
        ]);
        setLoading(false);
      };
      loadData();
    }
  }, [user]);

  return {
    analytics,
    versions,
    bulkOperations,
    loading,
    error,
    fetchAnalytics,
    fetchVersions,
    fetchBulkOperations,
    addConditionalRule,
    evaluateConditionalStep,
    createVersion,
    revertToVersion,
    createBulkOperation,
    getAnalyticsSummary
  };
}