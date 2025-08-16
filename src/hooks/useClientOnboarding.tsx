import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingStep {
  id: string;
  step_name: string;
  step_type: 'mandatory' | 'optional';
  description?: string;
  instructions?: string;
  requires_file_upload: boolean;
  completion_method: 'client' | 'trainer' | 'auto';
  display_order: number;
  status: 'pending' | 'completed' | 'skipped';
  completed_at?: string;
  completed_by?: string;
  completion_notes?: string;
  uploaded_file_url?: string;
  trainer_notes?: string;
  client_template_assignments?: {
    status: string;
    template_name: string;
  };
}

export interface OnboardingProgress {
  trainerId: string;
  trainerName: string;
  templateName?: string;
  steps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  percentageComplete: number;
}

export function useClientOnboarding() {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnboardingProgress = useCallback(async () => {
    if (!user) {
      console.log('🔍 ClientOnboarding: No user, setting loading false');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('🔍 ClientOnboarding: Fetching for user:', user.id);
      
      // First, get the active client engagement to find the trainer
      const { data: engagement, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select(`
          trainer_id,
          stage
        `)
        .eq('client_id', user.id)
        .eq('stage', 'active_client')
        .maybeSingle();

      console.log('🔍 ClientOnboarding: Engagement data:', { engagement, engagementError });

      if (engagementError) throw engagementError;
      
      if (!engagement) {
        console.log('🔍 ClientOnboarding: No active client engagement found');
        setOnboardingData(null);
        setLoading(false);
        return;
      }

      // Get trainer name
      const { data: trainerProfile, error: trainerError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', engagement.trainer_id)
        .single();

      console.log('🔍 ClientOnboarding: Trainer profile:', { trainerProfile, trainerError });

      if (trainerError) throw trainerError;

      // First, let's check if there are any onboarding progress records at all
      const { data: allProgressRecords, error: allProgressError } = await supabase
        .from('client_onboarding_progress')
        .select('*')
        .eq('client_id', user.id)
        .eq('trainer_id', engagement.trainer_id);

      console.log('🔍 ClientOnboarding: All progress records:', { allProgressRecords, allProgressError, count: allProgressRecords?.length });
      
      // Also check what template assignments exist
      const { data: allAssignments, error: assignmentsError } = await supabase
        .from('client_template_assignments')
        .select('*')
        .eq('client_id', user.id)
        .eq('trainer_id', engagement.trainer_id);

      console.log('🔍 ClientOnboarding: All template assignments:', { allAssignments, assignmentsError });

      // Get onboarding progress - only from active template assignments
      const { data: steps, error: stepsError } = await supabase
        .from('client_onboarding_progress')
        .select(`
          *,
          client_template_assignments!inner (
            status,
            template_name
          )
        `)
        .eq('client_id', user.id)
        .eq('trainer_id', engagement.trainer_id)
        .eq('client_template_assignments.status', 'active')
        .order('display_order');

      console.log('🔍 ClientOnboarding: Steps data:', { steps, stepsError, count: steps?.length });
      console.log('🔍 ClientOnboarding: Individual steps:', steps?.map(s => ({ 
        id: s.id, 
        step_name: s.step_name, 
        template_name: s.client_template_assignments?.template_name 
      })));

      if (stepsError) throw stepsError;

      const completedCount = steps?.filter(step => step.status === 'completed').length || 0;
      const totalCount = steps?.length || 0;
      const percentageComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const templateName = steps?.[0]?.client_template_assignments?.template_name;

      setOnboardingData({
        trainerId: engagement.trainer_id,
        trainerName: `${trainerProfile.first_name} ${trainerProfile.last_name}`,
        templateName,
        steps: (steps || []).map(step => ({
          ...step,
          step_type: step.step_type as 'mandatory' | 'optional',
          completion_method: step.completion_method as 'client' | 'trainer' | 'auto',
          status: step.status as 'pending' | 'completed' | 'skipped'
        })),
        completedCount,
        totalCount,
        percentageComplete
      });
    } catch (err) {
      console.error('Error fetching onboarding progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to load onboarding progress');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markStepComplete = useCallback(async (stepId: string, notes?: string, fileUrl?: string) => {
    if (!user || !onboardingData) return { error: 'No user or onboarding data' };

    try {
      const { error } = await supabase
        .from('client_onboarding_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user.id,
          completion_notes: notes,
          uploaded_file_url: fileUrl
        })
        .eq('id', stepId)
        .eq('client_id', user.id);

      if (error) throw error;

      // Refresh data
      await fetchOnboardingProgress();
      return { success: true };
    } catch (err) {
      console.error('Error marking step complete:', err);
      return { error: err instanceof Error ? err.message : 'Failed to mark step complete' };
    }
  }, [user, onboardingData, fetchOnboardingProgress]);

  const skipStep = useCallback(async (stepId: string, notes?: string) => {
    if (!user || !onboardingData) return { error: 'No user or onboarding data' };

    try {
      const { error } = await supabase
        .from('client_onboarding_progress')
        .update({
          status: 'skipped',
          completion_notes: notes
        })
        .eq('id', stepId)
        .eq('client_id', user.id);

      if (error) throw error;

      // Refresh data
      await fetchOnboardingProgress();
      return { success: true };
    } catch (err) {
      console.error('Error skipping step:', err);
      return { error: err instanceof Error ? err.message : 'Failed to skip step' };
    }
  }, [user, onboardingData, fetchOnboardingProgress]);

  useEffect(() => {
    fetchOnboardingProgress();
  }, [fetchOnboardingProgress]);

  return {
    onboardingData,
    loading,
    error,
    markStepComplete,
    skipStep,
    refetch: fetchOnboardingProgress
  };
}