import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryConfig } from '@/lib/queryConfig';

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
  const queryClient = useQueryClient();

  const { data: progress = null, isLoading: loading, refetch } = useQuery({
    queryKey: ['journey-progress', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [profileRes, stepsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('journey_stage, onboarding_step, total_onboarding_steps, quiz_completed, journey_progress')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('user_journey_tracking')
          .select('stage, step_name, completed_at')
          .eq('user_id', user.id)
      ]);

      if (profileRes.error) throw profileRes.error;
      if (stepsRes.error) throw stepsRes.error;

      const currentStage = 'profile_setup' as JourneyStage;
      const stageConfig = JOURNEY_STAGES[currentStage];
      
      let currentStep = 0;
      let totalSteps = stageConfig.steps.length;
      
      if (currentStage === 'onboarding') {
        currentStep = 1;
        totalSteps = 5;
      } else {
        const completedInStage = stepsRes.data?.filter(step => step.stage === currentStage).length || 0;
        currentStep = completedInStage;
      }

      const percentage = Math.round((currentStep / totalSteps) * 100);

      const steps: JourneyStep[] = stageConfig.steps.map((stepTitle, index) => ({
        id: `${currentStage}_${index}`,
        title: stepTitle,
        description: `Complete ${stepTitle.toLowerCase()}`,
        completed: index < currentStep,
        current: index === currentStep
      }));

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

      return {
        stage: currentStage,
        currentStep,
        totalSteps,
        percentage,
        steps,
        nextAction
      } as JourneyProgress;
    },
    enabled: !!user,
    staleTime: queryConfig.lists.staleTime,
    gcTime: queryConfig.lists.gcTime,
    refetchOnMount: false,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ stage, stepName, metadata }: { stage: JourneyStage; stepName: string; metadata?: any }) => {
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('user_journey_tracking')
        .upsert({
          user_id: user.id,
          stage,
          step_name: stepName,
          metadata: metadata || {}
        });

      await supabase
        .from('profiles')
        .update({ journey_stage: stage })
        .eq('id', user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-progress', user?.id] });
    }
  });

  const updateOnboardingStepMutation = useMutation({
    mutationFn: async (step: number) => {
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('profiles')
        .update({ onboarding_step: step })
        .eq('id', user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-progress', user?.id] });
    }
  });

  const advanceToStageMutation = useMutation({
    mutationFn: async (newStage: JourneyStage) => {
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('profiles')
        .update({ journey_stage: newStage })
        .eq('id', user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-progress', user?.id] });
    }
  });

  const updateProgress = async (stage: JourneyStage, stepName: string, metadata?: any) => {
    await updateProgressMutation.mutateAsync({ stage, stepName, metadata });
  };

  const updateOnboardingStep = async (step: number) => {
    await updateOnboardingStepMutation.mutateAsync(step);
  };

  const advanceToStage = async (newStage: JourneyStage) => {
    await advanceToStageMutation.mutateAsync(newStage);
  };

  return {
    progress,
    loading,
    updateProgress,
    updateOnboardingStep,
    advanceToStage,
    refetch
  };
};