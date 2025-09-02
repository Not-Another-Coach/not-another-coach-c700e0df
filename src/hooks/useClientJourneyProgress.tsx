import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ClientJourneyStage = 
  | 'preferences_identified'
  | 'exploring_coaches' 
  | 'getting_to_know_your_coach'
  | 'coach_chosen'
  | 'onboarding_in_progress'
  | 'on_your_journey'
  | 'goal_achieved';

export interface ClientJourneyStep {
  id: string;
  title: string;
  description: string;
  tooltip: string;
  completed: boolean;
  current?: boolean;
  hasData?: boolean;
  icon: '✅' | '🟠' | '⬜' | '⚪';
}

export interface ClientJourneyProgress {
  stage: ClientJourneyStage;
  currentStageIndex: number;
  totalStages: number;
  percentage: number;
  steps: ClientJourneyStep[];
  nextAction?: string;
  showCelebration?: boolean;
}

const CLIENT_JOURNEY_STAGES: Record<ClientJourneyStage, { 
  title: string; 
  description: string;
  tooltip: string;
}> = {
  preferences_identified: {
    title: 'Preferences Identified',
    description: 'Survey completed',
    tooltip: 'You\'ve completed your fitness goals and preferences survey!'
  },
  exploring_coaches: {
    title: 'Exploring Coaches',
    description: 'Discovering matches',
    tooltip: 'You\'ve started exploring and liking coaches. Keep browsing to find your perfect match!'
  },
  getting_to_know_your_coach: {
    title: 'Getting to Know Your Coach',
    description: 'Learning about your match',
    tooltip: 'You\'re getting to know your coach through discovery calls or messaging to see if they\'re the right fit'
  },
  coach_chosen: {
    title: 'Coach Chosen',
    description: 'Plan selected',
    tooltip: 'Excellent! You\'ve chosen your coach and selected a training plan.'
  },
  onboarding_in_progress: {
    title: 'Onboarding In Progress',
    description: 'Getting started',
    tooltip: 'You\'re completing your coach onboarding and getting ready to start!'
  },
  on_your_journey: {
    title: 'On Your Journey',
    description: 'Training active',
    tooltip: 'Congratulations! Your fitness journey with your coach is now active.'
  },
  goal_achieved: {
    title: 'Goal Achieved',
    description: 'Success reached',
    tooltip: 'Amazing! You\'ve achieved your fitness goals with your coach.'
  }
};

export const useClientJourneyProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ClientJourneyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      // Use the new consolidated function to get client journey stage
      const { data: journeyStage, error: journeyError } = await supabase
        .rpc('get_client_journey_stage', { p_client_id: user.id });

      if (journeyError) {
        console.error('Error fetching journey stage:', journeyError);
        return;
      }

      // Get user profile for survey completion check
      const { data: profile, error: profileError } = await supabase
        .from('v_clients')
        .select('client_survey_completed')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // If survey not complete, don't show journey tracker yet
      if (!profile?.client_survey_completed) {
        setProgress(null);
        setLoading(false);
        return;
      }

      // Map database stage to local ClientJourneyStage enum
      let currentStage: ClientJourneyStage;
      switch (journeyStage) {
        case 'browsing':
          currentStage = 'preferences_identified';
          break;
        case 'exploring_coaches':
        case 'liked':
        case 'shortlisted':
          currentStage = 'exploring_coaches';
          break;
        case 'getting_to_know_your_coach':
        case 'discovery_scheduled':
        case 'discovery_in_progress':
          currentStage = 'getting_to_know_your_coach';
          break;
        case 'discovery_completed':
        case 'agreed':
        case 'payment_pending':
        case 'coach_chosen':
          currentStage = 'coach_chosen';
          break;
        case 'onboarding_in_progress':
          currentStage = 'onboarding_in_progress';
          break;
        case 'active_client':
          currentStage = 'on_your_journey';
          break;
        case 'goal_achieved':
          currentStage = 'goal_achieved';
          break;
        default:
          currentStage = 'preferences_identified';
      }

      // Get engagement data to check for progress indicators
      const { data: engagements, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select('stage, trainer_id, liked_at, matched_at, discovery_completed_at, became_client_at')
        .eq('client_id', user.id);

      if (engagementError) throw engagementError;

      // Get discovery calls to check for booked calls
      const { data: discoveryCalls, error: discoveryError } = await supabase
        .from('discovery_calls')
        .select('id, status')
        .eq('client_id', user.id);

      if (discoveryError) throw discoveryError;

      // Get onboarding progress to check completion
      const { data: onboardingProgress, error: onboardingError } = await supabase
        .from('client_onboarding_progress')
        .select(`
          *,
          client_template_assignments!inner (
            status,
            template_name
          )
        `)
        .eq('client_id', user.id)
        .eq('client_template_assignments.status', 'active');

      if (onboardingError) {
        console.error('Error fetching onboarding progress:', onboardingError);
      }

      // Calculate onboarding completion percentage
      const totalOnboardingSteps = onboardingProgress?.length || 0;
      const completedOnboardingSteps = onboardingProgress?.filter(step => step.status === 'completed').length || 0;
      const onboardingCompletionPercentage = totalOnboardingSteps > 0 ? (completedOnboardingSteps / totalOnboardingSteps) * 100 : 0;

      // Auto-advance to "on_your_journey" if onboarding is 100% complete
      if (currentStage === 'onboarding_in_progress' && onboardingCompletionPercentage === 100) {
        currentStage = 'on_your_journey';
        
        // Update the engagement to mark as active_client
        await supabase.rpc('update_engagement_stage', {
          client_uuid: user.id,
          trainer_uuid: engagements?.[0]?.trainer_id || user.id,
          new_stage: 'active_client'
        });
      }

      const currentStageIndex = getStageIndex(currentStage);
      const totalStages = Object.keys(CLIENT_JOURNEY_STAGES).length;
      const percentage = Math.round(((currentStageIndex + 1) / totalStages) * 100);

      // Build steps array
      const steps: ClientJourneyStep[] = Object.entries(CLIENT_JOURNEY_STAGES).map(([stageKey, config], index) => {
        const completed = index <= currentStageIndex;
        const current = index === currentStageIndex;
        
        // Determine if stage has data/progress
        let hasData = false;
        const hasLikedCoaches = engagements?.some(e => e.liked_at) || (engagements?.length || 0) > 0;
        const hasDiscoveryCall = engagements?.some(e => e.matched_at) || discoveryCalls?.some(dc => dc.status === 'scheduled');
        const isInGettingToKnowStage = engagements?.some(e => e.stage === 'getting_to_know_your_coach');
        const hasChosenCoach = engagements?.some(e => e.discovery_completed_at);
        const isOnboarding = engagements?.some(e => e.became_client_at && !e.discovery_completed_at);
        const isActiveClient = engagements?.some(e => e.became_client_at && e.discovery_completed_at);

        if (stageKey === 'preferences_identified') {
          hasData = profile?.client_survey_completed || false;
        } else if (stageKey === 'exploring_coaches') {
          hasData = hasLikedCoaches;
        } else if (stageKey === 'getting_to_know_your_coach') {
          hasData = hasDiscoveryCall || isInGettingToKnowStage;
        } else if (stageKey === 'coach_chosen') {
          hasData = hasChosenCoach;
        } else if (stageKey === 'onboarding_in_progress') {
          hasData = isOnboarding;
        } else if (stageKey === 'on_your_journey') {
          hasData = isActiveClient;
        } else if (stageKey === 'goal_achieved') {
          hasData = false;
        }
        
        // Determine icon based on completion and data state
        let icon: '✅' | '🟠' | '⬜' | '⚪' = '⚪';
        if (completed) {
          icon = '✅';
        } else if (current && hasData) {
          icon = '🟠'; // Orange for partial progress
        } else if (current) {
          icon = '🟠'; // Orange for current stage  
        } else {
          icon = '⬜'; // Grey for future stages
        }
        
        return {
          id: stageKey,
          title: config.title,
          description: config.description,
          tooltip: config.tooltip,
          completed,
          current,
          hasData,
          icon
        };
      });

      // Determine next action
      let nextAction = '';
      const hasLikedCoaches = engagements?.some(e => e.liked_at) || (engagements?.length || 0) > 0;
      const hasShortlisted = engagements?.some(e => e.stage === 'shortlisted');
      const hasDiscoveryCallBookedFromEngagement = discoveryCalls?.length > 0;

      switch (currentStage) {
        case 'preferences_identified':
          nextAction = 'Start exploring coaches that match your preferences';
          break;
        case 'exploring_coaches':
          if (hasShortlisted && !hasDiscoveryCallBookedFromEngagement) {
            nextAction = 'Book discovery calls with your shortlisted coaches';
          } else if (hasLikedCoaches) {
            nextAction = 'Shortlist your favorite coaches to unlock discovery calls';
          } else {
            nextAction = 'Like and shortlist coaches you\'re interested in';
          }
          break;
        case 'getting_to_know_your_coach':
          nextAction = 'Complete your discovery call and choose your coach';
          break;
        case 'coach_chosen':
          nextAction = 'Complete your coach onboarding process';
          break;
        case 'onboarding_in_progress':
          nextAction = 'Finish onboarding and start your training';
          break;
        case 'on_your_journey':
          nextAction = 'Continue your fitness journey with your coach';
          break;
        case 'goal_achieved':
          nextAction = 'Congratulations! Consider renewal, new goals, or sharing your success story.';
          break;
      }

      setProgress({
        stage: currentStage,
        currentStageIndex,
        totalStages,
        percentage,
        steps,
        nextAction
      });

    } catch (error) {
      console.error('Error fetching client journey progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateJourneyStage = async (newStage: ClientJourneyStage) => {
    if (!user) return;

    try {
      // Map local stage to database engagement stage
      let dbStage: any = newStage;
      switch (newStage) {
        case 'preferences_identified':
          dbStage = 'browsing';
          break;
        case 'exploring_coaches':
          dbStage = 'exploring_coaches';
          break;
        case 'getting_to_know_your_coach':
          dbStage = 'getting_to_know_your_coach';
          break;
        case 'coach_chosen':
          dbStage = 'coach_chosen';
          break;
        case 'onboarding_in_progress':
          dbStage = 'onboarding_in_progress';
          break;
        case 'on_your_journey':
          dbStage = 'active_client';
          break;
        case 'goal_achieved':
          dbStage = 'goal_achieved';
          break;
      }

      // Update via the engagement system instead of profile
      await supabase.rpc('update_engagement_stage', {
        client_uuid: user.id,
        trainer_uuid: user.id, // Use self-reference for general journey tracking
        new_stage: dbStage
      });

      await fetchProgress();
    } catch (error) {
      console.error('Error updating client journey stage:', error);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  return {
    progress,
    loading,
    updateJourneyStage,
    refetch: fetchProgress
  };
};

function getStageIndex(stage: ClientJourneyStage): number {
  const stages = Object.keys(CLIENT_JOURNEY_STAGES);
  return stages.indexOf(stage);
}