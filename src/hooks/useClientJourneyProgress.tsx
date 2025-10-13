import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ClientJourneyStage = 
  | 'preferences_identified'
  | 'exploring_coaches' 
  | 'getting_to_know_your_coach'
  | 'coach_chosen'
  | 'onboarding_in_progress'
  | 'on_your_journey';

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
    title: '🎉 On Your Journey',
    description: 'Training active',
    tooltip: 'Congratulations! Your fitness journey with your coach is now active and your package has commenced.'
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
      // Use new RPC function to get accurate journey stage
      const { data: journeyStage, error: rpcError } = await supabase
        .rpc('get_client_journey_stage', { p_client_id: user.id });

      let currentStage: ClientJourneyStage = 'preferences_identified';
      
      if (rpcError) {
        console.error('Error fetching journey stage:', rpcError);
        // Fallback: check client profile directly
        const { data: profile } = await supabase
          .from('v_clients')
          .select('client_survey_completed')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.client_survey_completed) {
          currentStage = 'exploring_coaches';
        }
      } else {
        // Map RPC result to our stage types, but we'll check onboarding for active_client below
        const stageMap: Record<string, ClientJourneyStage> = {
          'profile_setup': 'preferences_identified',
          'exploring_coaches': 'exploring_coaches', 
          'browsing': 'preferences_identified',
          'liked': 'exploring_coaches',
          'shortlisted': 'exploring_coaches',
          'discovery_in_progress': 'getting_to_know_your_coach',
          'discovery_call_booked': 'getting_to_know_your_coach',
          'discovery_completed': 'coach_chosen',
          'waitlist': 'coach_chosen',
          'active_client': 'onboarding_in_progress' // Default to onboarding, we'll check completion below
        };
        currentStage = stageMap[journeyStage] || 'preferences_identified';
      }

      // Removed early return - all clients see full journey regardless of stage

      // Get engagement data for more detailed progress
      const { data: engagements } = await supabase
        .from('client_trainer_engagement')
        .select('stage, trainer_id, liked_at, matched_at, discovery_completed_at, became_client_at')
        .eq('client_id', user.id);

      // Get discovery calls to check for booked calls
      const { data: discoveryCalls } = await supabase
        .from('discovery_calls')
        .select('id, status')
        .eq('client_id', user.id);

      // Get onboarding progress to check completion
      const { data: onboardingProgress } = await supabase
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

      // Calculate onboarding completion percentage
      const totalOnboardingSteps = onboardingProgress?.length || 0;
      const completedOnboardingSteps = onboardingProgress?.filter(step => step.status === 'completed').length || 0;
      const onboardingCompletionPercentage = totalOnboardingSteps > 0 ? (completedOnboardingSteps / totalOnboardingSteps) * 100 : 0;

      // If a discovery call is booked, ensure we surface the correct stage even if RPC lags
      const hasScheduledCall = discoveryCalls?.some(dc => dc.status === 'scheduled' || dc.status === 'rescheduled');
      if (hasScheduledCall && (currentStage === 'preferences_identified' || currentStage === 'exploring_coaches')) {
        currentStage = 'getting_to_know_your_coach';
      }

      // For active clients, determine stage based on onboarding completion
      if (journeyStage === 'active_client') {
        if (totalOnboardingSteps > 0) {
          // Has onboarding tasks - check completion
          if (onboardingCompletionPercentage === 100) {
            currentStage = 'on_your_journey';
          } else {
            currentStage = 'onboarding_in_progress';
          }
        } else {
          // No onboarding tasks assigned yet - still in onboarding phase waiting for template
          currentStage = 'onboarding_in_progress';
        }
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
        const hasChosenCoach = engagements?.some(e => e.discovery_completed_at);
        // Check onboarding/active client status based on actual progress, not just engagement
        // Client is in onboarding if they're an active_client AND (no template OR incomplete template)
        const isOnboarding = engagements?.some(e => e.became_client_at) && 
                           (totalOnboardingSteps === 0 || onboardingCompletionPercentage < 100);
        // Client is truly on their journey only if they have completed onboarding
        const isActiveClient = engagements?.some(e => e.became_client_at) && 
                              totalOnboardingSteps > 0 && 
                              onboardingCompletionPercentage === 100;

        if (stageKey === 'preferences_identified') {
          hasData = true; // Always has data if we're showing the progress
        } else if (stageKey === 'exploring_coaches') {
          hasData = hasLikedCoaches;
        } else if (stageKey === 'getting_to_know_your_coach') {
          hasData = hasDiscoveryCall;
        } else if (stageKey === 'coach_chosen') {
          hasData = hasChosenCoach;
        } else if (stageKey === 'onboarding_in_progress') {
          hasData = isOnboarding;
        } else if (stageKey === 'on_your_journey') {
          hasData = isActiveClient;
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

      // Determine next action based on current stage
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
          nextAction = ''; // No next action for final celebratory stage
          break;
      }

      setProgress({
        stage: currentStage,
        currentStageIndex,
        totalStages,
        percentage,
        steps,
        nextAction,
        showCelebration: currentStage === 'on_your_journey'
      });

    } catch (error) {
      console.error('Error fetching journey progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateJourneyStage = async (newStage: ClientJourneyStage) => {
    if (!user) return;

    try {
      // Update both tables for consistency
      await supabase
        .from('profiles')
        .update({ journey_stage: newStage })
        .eq('id', user.id);

      await supabase
        .from('client_profiles')
        .update({ client_journey_stage: newStage })
        .eq('id', user.id);

      await fetchProgress();
    } catch (error) {
      console.error('Error updating journey stage:', error);
    }
  };

  // Add debouncing to prevent excessive calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProgress();
    }, 200);

    return () => clearTimeout(timeoutId);
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