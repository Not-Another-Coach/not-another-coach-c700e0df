import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ClientJourneyStage = 
  | 'preferences_identified'
  | 'exploring_coaches' 
  | 'discovery_call_booked'
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
  discovery_call_booked: {
    title: 'Discovery Call Booked',
    description: 'First call scheduled',
    tooltip: 'Great! You\'ve booked your first discovery call with a coach.'
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
      // Get user profile with survey completion
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('client_survey_completed, client_journey_stage')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get engagement data to determine current stage
      const { data: engagements, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select('stage, liked_at, matched_at, discovery_completed_at, became_client_at')
        .eq('client_id', user.id);

      if (engagementError) throw engagementError;

      // Get discovery calls to check for booked calls
      const { data: discoveryCalls, error: discoveryError } = await supabase
        .from('discovery_calls')
        .select('id, status')
        .eq('client_id', user.id);

      if (discoveryError) throw discoveryError;

      // Determine current stage based on data
      let currentStage: ClientJourneyStage = 'preferences_identified';
      
      // Check if survey is completed (100%)
      if (!profile?.client_survey_completed) {
        // If survey not complete, don't show journey tracker yet
        setProgress(null);
        setLoading(false);
        return;
      }

      
      // Stage 1: Survey completed - automatically advance to exploring coaches
      if (profile?.client_survey_completed) {
        currentStage = 'exploring_coaches';
      }

      // Stage 2: Has actually liked coaches or has engagement records
      const hasLikedCoaches = engagements?.some(e => e.liked_at) || (engagements?.length || 0) > 0;
      if (hasLikedCoaches) {
        // Keep at exploring_coaches stage but with data
        currentStage = 'exploring_coaches';
      }

      // Stage 3: Has discovery call booked (matched stage or scheduled discovery call)
      const hasDiscoveryCall = engagements?.some(e => e.matched_at) || discoveryCalls?.some(dc => dc.status === 'scheduled');
      if (hasDiscoveryCall) {
        currentStage = 'discovery_call_booked';
      }

      // Stage 4: Discovery completed (coach chosen)
      const hasChosenCoach = engagements?.some(e => e.discovery_completed_at);
      if (hasChosenCoach) {
        currentStage = 'coach_chosen';
      }

      // Stage 5: Became active client (onboarding)
      const isOnboarding = engagements?.some(e => e.became_client_at && !e.discovery_completed_at);
      if (isOnboarding) {
        currentStage = 'onboarding_in_progress';
      }

      // Stage 6: Fully active (on journey)
      const isActiveClient = engagements?.some(e => e.became_client_at && e.discovery_completed_at);
      if (isActiveClient) {
        currentStage = 'on_your_journey';
      }

      // Use stored stage if available and more advanced
      const storedStage = profile?.client_journey_stage as ClientJourneyStage;
      if (storedStage && getStageIndex(storedStage) > getStageIndex(currentStage)) {
        currentStage = storedStage;
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
        if (stageKey === 'preferences_identified') {
          hasData = profile?.client_survey_completed || false;
        } else if (stageKey === 'exploring_coaches') {
          hasData = hasLikedCoaches;
        } else if (stageKey === 'discovery_call_booked') {
          hasData = hasDiscoveryCall;
        } else if (stageKey === 'coach_chosen') {
          hasData = hasChosenCoach;
        } else if (stageKey === 'onboarding_in_progress') {
          hasData = isOnboarding;
        } else if (stageKey === 'on_your_journey') {
          hasData = isActiveClient;
        } else if (stageKey === 'goal_achieved') {
          // Goal achieved is manually set by coach/admin
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
      switch (currentStage) {
        case 'preferences_identified':
          nextAction = 'Start exploring coaches that match your preferences';
          break;
        case 'exploring_coaches':
          const hasShortlisted = engagements?.some(e => e.stage === 'shortlisted');
          const hasDiscoveryCallBookedFromEngagement = discoveryCalls?.length > 0;
          
          if (hasShortlisted && !hasDiscoveryCallBookedFromEngagement) {
            nextAction = 'Book discovery calls with your shortlisted coaches';
          } else if (hasLikedCoaches) {
            nextAction = 'Shortlist your favorite coaches to unlock discovery calls';
          } else {
            nextAction = 'Like and shortlist coaches you\'re interested in';
          }
          break;
        case 'discovery_call_booked':
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
      await supabase
        .from('profiles')
        .update({ client_journey_stage: newStage })
        .eq('id', user.id);

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