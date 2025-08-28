import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface EnhancedOnboardingStep {
  id: string;
  activity_id: string;
  activity_name: string;
  activity_type: 'task' | 'appointment' | 'survey' | 'training_content' | 'file_upload';
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  due_at?: string;
  sla_due_at?: string;
  completion_data?: any;
  appointment_config?: any;
  survey_config?: any;
  content_config?: any;
  upload_config?: any;
  instructions?: string;
  guidance_html?: string;
}

export interface EnhancedOnboardingProgress {
  trainer_id: string;
  trainer_name: string;
  trainer_profile_image?: string;
  template_assignment_id: string;
  template_name: string;
  steps: EnhancedOnboardingStep[];
  total_steps: number;
  completed_steps: number;
  completion_percentage: number;
}

export const useClientOnboardingEnhanced = () => {
  const [onboardingData, setOnboardingData] = useState<EnhancedOnboardingProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOnboardingProgress = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // First, get the active template assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('client_template_assignments')
        .select('id, trainer_id, template_name')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single();

      if (assignmentError) {
        if (assignmentError.code === 'PGRST116') {
          setOnboardingData(null);
          return;
        }
        throw assignmentError;
      }

      // Get trainer profile separately
      const { data: trainerProfile, error: trainerError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', assignment.trainer_id)
        .single();

      // Then get all activity completions for this assignment
      const { data: completions, error: completionsError } = await supabase
        .from('activity_completions')
        .select(`
          *,
          trainer_onboarding_activities (
            activity_name,
            activity_type,
            description,
            instructions,
            guidance_html,
            appointment_config,
            survey_config,
            content_config,
            upload_config
          )
        `)
        .eq('client_id', user.id)
        .eq('trainer_id', assignment.trainer_id)
        .eq('template_assignment_id', assignment.id)
        .order('created_at', { ascending: true });

      if (completionsError) throw completionsError;

      if (trainerError) {
        console.warn('Could not fetch trainer profile:', trainerError);
      }

      const trainerName = trainerProfile 
        ? `${trainerProfile.first_name} ${trainerProfile.last_name}`.trim()
        : 'Your Trainer';

      const steps: EnhancedOnboardingStep[] = (completions || []).map(completion => ({
        id: completion.id,
        activity_id: completion.activity_id,
        activity_name: completion.trainer_onboarding_activities?.activity_name || 'Unnamed Activity',
        activity_type: completion.activity_type as any,
        description: completion.trainer_onboarding_activities?.description,
        status: completion.status as any,
        due_at: completion.due_at,
        sla_due_at: completion.sla_due_at,
        completion_data: completion.completion_data,
        appointment_config: completion.trainer_onboarding_activities?.appointment_config,
        survey_config: completion.trainer_onboarding_activities?.survey_config,
        content_config: completion.trainer_onboarding_activities?.content_config,
        upload_config: completion.trainer_onboarding_activities?.upload_config,
        instructions: completion.trainer_onboarding_activities?.instructions,
        guidance_html: completion.trainer_onboarding_activities?.guidance_html,
      }));

      const completedSteps = steps.filter(step => step.status === 'completed').length;
      const totalSteps = steps.length;

      setOnboardingData({
        trainer_id: assignment.trainer_id,
        trainer_name: trainerName,
        trainer_profile_image: undefined,
        template_assignment_id: assignment.id,
        template_name: assignment.template_name,
        steps,
        total_steps: totalSteps,
        completed_steps: completedSteps,
        completion_percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      });

    } catch (err) {
      console.error('Error fetching enhanced onboarding progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch onboarding progress');
      setOnboardingData(null);
    } finally {
      setLoading(false);
    }
  };

  const markStepComplete = async (stepId: string, completionData: any = {}) => {
    if (!user || !onboardingData) return;

    try {
      const { error } = await supabase
        .from('activity_completions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_data: completionData
        })
        .eq('id', stepId);

      if (error) throw error;

      toast({
        title: "Step Completed",
        description: "Great job! You've completed this onboarding step.",
      });

      await fetchOnboardingProgress();
    } catch (err) {
      console.error('Error marking step complete:', err);
      toast({
        title: "Error",
        description: "Failed to mark step as complete. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scheduleAppointment = async (stepId: string, appointmentData: any) => {
    if (!user || !onboardingData) return;

    try {
      const step = onboardingData.steps.find(s => s.id === stepId);
      if (!step) return;

      // Create appointment record
      const { error: appointmentError } = await supabase
        .from('activity_appointments')
        .insert({
          activity_id: step.activity_id,
          client_id: user.id,
          trainer_id: onboardingData.trainer_id,
          ...appointmentData
        });

      if (appointmentError) throw appointmentError;

      // Update completion status
      const { error: updateError } = await supabase
        .from('activity_completions')
        .update({
          status: 'in_progress',
          completion_data: {
            appointment_scheduled: true,
            scheduled_at: appointmentData.scheduled_at
          }
        })
        .eq('id', stepId);

      if (updateError) throw updateError;

      toast({
        title: "Appointment Scheduled",
        description: "Your appointment has been scheduled successfully.",
      });

      await fetchOnboardingProgress();
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const skipStep = async (stepId: string, reason: string = '') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activity_completions')
        .update({
          status: 'skipped',
          completion_data: { skip_reason: reason }
        })
        .eq('id', stepId);

      if (error) throw error;

      toast({
        title: "Step Skipped",
        description: "Step has been marked as skipped.",
      });

      await fetchOnboardingProgress();
    } catch (err) {
      console.error('Error skipping step:', err);
      toast({
        title: "Error",
        description: "Failed to skip step. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchOnboardingProgress();
    }
  }, [user]);

  return {
    onboardingData,
    loading,
    error,
    markStepComplete,
    scheduleAppointment,
    skipStep,
    refetch: fetchOnboardingProgress,
  };
};