import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type JourneyStage = 
  | 'profile_setup'
  | 'onboarding' 
  | 'discovery'
  | 'shortlisting'
  | 'initial_contact'
  | 'discovery_call'
  | 'trial_session'
  | 'connected';

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current?: boolean;
  metadata?: {
    isPartial?: boolean;
    [key: string]: any;
  };
}

export interface JourneyProgress {
  stage: JourneyStage;
  currentStep: number;
  totalSteps: number;
  percentage: number;
  steps: JourneyStep[];
  nextAction?: string;
}

const JOURNEY_STAGES: Record<JourneyStage, { title: string; steps: string[] }> = {
  profile_setup: {
    title: 'Profile Setup',
    steps: ['Create Account', 'Personal Info', 'Preferences']
  },
  onboarding: {
    title: 'Fitness Assessment',
    steps: ['Goals', 'Experience', 'Training Style', 'Budget', 'Location']
  },
  discovery: {
    title: 'Discover Trainers',
    steps: ['Browse Matches', 'Review Profiles', 'Use Filters']
  },
  shortlisting: {
    title: 'Build Your Shortlist',
    steps: ['Save Favorites', 'Compare Options', 'Narrow Down']
  },
  initial_contact: {
    title: 'Make Contact',
    steps: ['Send Messages', 'Express Interest', 'Share Goals']
  },
  discovery_call: {
    title: 'Discovery Call',
    steps: ['Schedule Call', 'Discuss Needs', 'Ask Questions']
  },
  trial_session: {
    title: 'Trial Session',
    steps: ['Book Trial', 'Complete Session', 'Evaluate Fit']
  },
  connected: {
    title: 'Connected!',
    steps: ['Select Trainer', 'Start Training', 'Track Progress']
  }
};

export const useJourneyProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      // Get user profile with journey data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('journey_stage, onboarding_step, total_onboarding_steps, quiz_completed, journey_progress')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get completed journey steps
      const { data: completedSteps, error: stepsError } = await supabase
        .from('user_journey_tracking')
        .select('stage, step_name, completed_at')
        .eq('user_id', user.id);

      if (stepsError) throw stepsError;

      const currentStage = (profile?.journey_stage as JourneyStage) || 'profile_setup';
      const stageConfig = JOURNEY_STAGES[currentStage];
      
      // Calculate progress
      let currentStep = 0;
      let totalSteps = stageConfig.steps.length;
      
      if (currentStage === 'onboarding') {
        currentStep = profile?.onboarding_step || 1;
        totalSteps = profile?.total_onboarding_steps || 5;
      } else {
        // Count completed steps for current stage
        const completedInStage = completedSteps?.filter(step => step.stage === currentStage).length || 0;
        currentStep = completedInStage;
      }

      const percentage = Math.round((currentStep / totalSteps) * 100);

      // Build steps array
      const steps: JourneyStep[] = stageConfig.steps.map((stepTitle, index) => ({
        id: `${currentStage}_${index}`,
        title: stepTitle,
        description: `Complete ${stepTitle.toLowerCase()}`,
        completed: index < currentStep,
        current: index === currentStep
      }));

      // Determine next action
      let nextAction = '';
      switch (currentStage) {
        case 'profile_setup':
          nextAction = 'Complete your profile setup';
          break;
        case 'onboarding':
          nextAction = 'Complete the fitness quiz';
          break;
        case 'discovery':
          nextAction = 'Browse and discover trainers';
          break;
        case 'shortlisting':
          nextAction = 'Save trainers to your shortlist';
          break;
        case 'initial_contact':
          nextAction = 'Message your preferred trainers';
          break;
        case 'discovery_call':
          nextAction = 'Schedule a discovery call';
          break;
        case 'trial_session':
          nextAction = 'Book a trial session';
          break;
        default:
          nextAction = 'Continue your fitness journey';
      }

      setProgress({
        stage: currentStage,
        currentStep,
        totalSteps,
        percentage,
        steps,
        nextAction
      });

    } catch (error) {
      console.error('Error fetching journey progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (stage: JourneyStage, stepName: string, metadata?: any) => {
    if (!user) return;

    try {
      // Record the completed step
      await supabase
        .from('user_journey_tracking')
        .upsert({
          user_id: user.id,
          stage,
          step_name: stepName,
          metadata: metadata || {}
        });

      // Update profile journey stage if needed
      await supabase
        .from('profiles')
        .update({ journey_stage: stage })
        .eq('id', user.id);

      // Refresh progress
      await fetchProgress();
    } catch (error) {
      console.error('Error updating journey progress:', error);
    }
  };

  const updateOnboardingStep = async (step: number) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ onboarding_step: step })
        .eq('id', user.id);

      await fetchProgress();
    } catch (error) {
      console.error('Error updating onboarding step:', error);
    }
  };

  const advanceToStage = async (newStage: JourneyStage) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ journey_stage: newStage })
        .eq('id', user.id);

      await fetchProgress();
    } catch (error) {
      console.error('Error advancing to stage:', error);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  return {
    progress,
    loading,
    updateProgress,
    updateOnboardingStep,
    advanceToStage,
    refetch: fetchProgress
  };
};