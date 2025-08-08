import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingTemplate {
  id: string;
  step_name: string;
  step_type: 'mandatory' | 'optional';
  description?: string;
  instructions?: string;
  requires_file_upload: boolean;
  completion_method: 'client' | 'trainer' | 'auto';
  display_order: number;
  is_active: boolean;
}

export interface ClientOnboardingData {
  clientId: string;
  clientName: string;
  steps: Array<{
    id: string;
    step_name: string;
    step_type: 'mandatory' | 'optional';
    status: 'pending' | 'completed' | 'skipped';
    completed_at?: string;
    completion_notes?: string;
    trainer_notes?: string;
    requires_file_upload: boolean;
    uploaded_file_url?: string;
  }>;
  completedCount: number;
  totalCount: number;
  percentageComplete: number;
}

export function useTrainerOnboarding() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [clientsOnboarding, setClientsOnboarding] = useState<ClientOnboardingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trainer_onboarding_templates')
        .select('*')
        .eq('trainer_id', user.id)
        .order('display_order');

      if (error) throw error;

      setTemplates((data || []).map(template => ({
        ...template,
        step_type: template.step_type as 'mandatory' | 'optional',
        completion_method: template.completion_method as 'client' | 'trainer' | 'auto'
      })));
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    }
  }, [user]);

  const fetchClientsOnboarding = useCallback(async () => {
    if (!user) return;

    try {
      // Get active clients
      const { data: engagements, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select('client_id')
        .eq('trainer_id', user.id)
        .eq('stage', 'active_client');

      if (engagementError) throw engagementError;

      if (!engagements || engagements.length === 0) {
        setClientsOnboarding([]);
        return;
      }

      // Get client profiles separately
      const clientIds = engagements.map(e => e.client_id);
      const { data: clientProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', clientIds);

      if (profileError) throw profileError;

      // Get onboarding progress for each client
      const clientsData: ClientOnboardingData[] = [];

      for (const engagement of engagements) {
        const { data: steps, error: stepsError } = await supabase
          .from('client_onboarding_progress')
          .select('*')
          .eq('client_id', engagement.client_id)
          .eq('trainer_id', user.id)
          .order('display_order');

        if (stepsError) throw stepsError;

        const completedCount = steps?.filter(step => step.status === 'completed').length || 0;
        const totalCount = steps?.length || 0;
        const percentageComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const clientProfile = clientProfiles?.find(p => p.id === engagement.client_id);
        clientsData.push({
          clientId: engagement.client_id,
          clientName: `${clientProfile?.first_name || ''} ${clientProfile?.last_name || ''}`.trim() || 'Unknown Client',
          steps: (steps || []).map(step => ({
            id: step.id,
            step_name: step.step_name,
            step_type: step.step_type as 'mandatory' | 'optional',
            status: step.status as 'pending' | 'completed' | 'skipped',
            completed_at: step.completed_at,
            completion_notes: step.completion_notes,
            trainer_notes: step.trainer_notes,
            requires_file_upload: step.requires_file_upload,
            uploaded_file_url: step.uploaded_file_url
          })),
          completedCount,
          totalCount,
          percentageComplete
        });
      }

      setClientsOnboarding(clientsData);
    } catch (err) {
      console.error('Error fetching clients onboarding:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clients onboarding data');
    }
  }, [user]);

  const createTemplate = useCallback(async (template: Omit<OnboardingTemplate, 'id'>) => {
    if (!user) return { error: 'No user' };

    try {
      const { error } = await supabase
        .from('trainer_onboarding_templates')
        .insert({
          trainer_id: user.id,
          ...template
        });

      if (error) throw error;

      await fetchTemplates();
      return { success: true };
    } catch (err) {
      console.error('Error creating template:', err);
      return { error: err instanceof Error ? err.message : 'Failed to create template' };
    }
  }, [user, fetchTemplates]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<OnboardingTemplate>) => {
    if (!user) return { error: 'No user' };

    try {
      const { error } = await supabase
        .from('trainer_onboarding_templates')
        .update(updates)
        .eq('id', templateId)
        .eq('trainer_id', user.id);

      if (error) throw error;

      await fetchTemplates();
      return { success: true };
    } catch (err) {
      console.error('Error updating template:', err);
      return { error: err instanceof Error ? err.message : 'Failed to update template' };
    }
  }, [user, fetchTemplates]);

  const markClientStepComplete = useCallback(async (stepId: string, trainerNotes?: string) => {
    if (!user) return { error: 'No user' };

    try {
      const { error } = await supabase
        .from('client_onboarding_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user.id,
          trainer_notes: trainerNotes
        })
        .eq('id', stepId)
        .eq('trainer_id', user.id);

      if (error) throw error;

      await fetchClientsOnboarding();
      return { success: true };
    } catch (err) {
      console.error('Error marking client step complete:', err);
      return { error: err instanceof Error ? err.message : 'Failed to mark step complete' };
    }
  }, [user, fetchClientsOnboarding]);

  const updateClientStep = useCallback(async (stepId: string, updates: { step_name?: string; description?: string; instructions?: string; trainer_notes?: string }) => {
    if (!user) return { error: 'No user' };

    try {
      const { error } = await supabase
        .from('client_onboarding_progress')
        .update(updates)
        .eq('id', stepId)
        .eq('trainer_id', user.id);

      if (error) throw error;

      await fetchClientsOnboarding();
      return { success: true };
    } catch (err) {
      console.error('Error updating client step:', err);
      return { error: err instanceof Error ? err.message : 'Failed to update step' };
    }
  }, [user, fetchClientsOnboarding]);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    await Promise.all([fetchTemplates(), fetchClientsOnboarding()]);
    setLoading(false);
  }, [user, fetchTemplates, fetchClientsOnboarding]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    templates,
    clientsOnboarding,
    loading,
    error,
    createTemplate,
    updateTemplate,
    markClientStepComplete,
    updateClientStep,
    refetch: fetchData
  };
}