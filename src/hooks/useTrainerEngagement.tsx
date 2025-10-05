import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type EngagementStage = 'browsing' | 'liked' | 'shortlisted' | 'getting_to_know_your_coach' | 'discovery_in_progress' | 'matched' | 'discovery_completed' | 'agreed' | 'payment_pending' | 'active_client' | 'unmatched' | 'declined' | 'declined_dismissed';

interface TrainerEngagement {
  trainerId: string;
  stage: EngagementStage;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  likedAt?: string;
  matchedAt?: string;
  discoveryCompletedAt?: string;
  becameClientAt?: string;
}

export function useTrainerEngagement(refreshTrigger?: number) {
  const { user } = useAuth();
  const [engagements, setEngagements] = useState<TrainerEngagement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEngagements = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    console.log('🔄 Fetching engagement data for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('client_trainer_engagement')
        .select('*')
        .eq('client_id', user.id);

      if (error) {
        console.error('Error fetching engagements:', error);
        return;
      }

      const engagementData: TrainerEngagement[] = data?.map(item => ({
        trainerId: item.trainer_id,
        stage: item.stage as EngagementStage,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        likedAt: item.liked_at,
        matchedAt: item.matched_at,
        discoveryCompletedAt: item.discovery_completed_at,
        becameClientAt: item.became_client_at
      })) || [];

      setEngagements(engagementData);
      console.log('✅ Engagement data loaded:', engagementData.length, 'engagements');
    } catch (error) {
      console.error('Error fetching engagements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagements();
  }, [user, refreshTrigger]);

  const updateEngagementStage = async (trainerId: string, newStage: EngagementStage) => {
    if (!user) return;

    // Store previous state for rollback
    const previousEngagements = [...engagements];

    // Optimistic update - update local state immediately
    setEngagements(prevEngagements => {
      const existingIndex = prevEngagements.findIndex(e => e.trainerId === trainerId);
      const now = new Date().toISOString();
      
      if (existingIndex >= 0) {
        // Update existing engagement
        const updated = [...prevEngagements];
        updated[existingIndex] = { 
          ...updated[existingIndex], 
          stage: newStage, 
          updatedAt: now 
        };
        return updated;
      } else {
        // Create new engagement
        return [...prevEngagements, {
          trainerId,
          stage: newStage,
          createdAt: now,
          updatedAt: now
        }];
      }
    });

    try {
      const { error } = await supabase.rpc('update_engagement_stage', {
        client_uuid: user.id,
        trainer_uuid: trainerId,
        new_stage: newStage as any
      });

      if (error) {
        console.error('Error updating engagement stage:', error);
        // Rollback optimistic update
        setEngagements(previousEngagements);
        return;
      }

      // Confirm with database fetch
      await fetchEngagements();
    } catch (error) {
      console.error('Error updating engagement stage:', error);
      // Rollback optimistic update
      setEngagements(previousEngagements);
    }
  };

  const getEngagementStage = (trainerId: string): EngagementStage => {
    const engagement = engagements.find(e => e.trainerId === trainerId);
    return engagement?.stage || 'browsing';
  };

  const getLikedTrainers = () => {
    return engagements.filter(e => e.stage === 'liked');
  };

  const getShortlistedTrainers = () => {
    // Return ALL trainers that are beyond the browsing/liked stage
    // This includes shortlisted, discovery_call_booked, discovery_in_progress, and discovery_completed
    // The consuming component will filter these based on their specific needs
    return engagements.filter(e => 
      e.stage === 'shortlisted' || 
      e.stage === 'getting_to_know_your_coach' || 
      e.stage === 'discovery_in_progress' ||
      e.stage === 'discovery_completed'
    );
  };

  const getOnlyShortlistedTrainers = () => {
    // Return only trainers with 'shortlisted' stage
    return engagements.filter(e => e.stage === 'shortlisted');
  };

  const getDiscoveryStageTrainers = () => {
    // Return trainers with discovery call stages and discovery in progress
    return engagements.filter(e => 
      e.stage === 'getting_to_know_your_coach' || 
      e.stage === 'discovery_in_progress' ||
      e.stage === 'discovery_completed'
    );
  };

  const getAgreedTrainers = () => {
    return engagements.filter(e => e.stage === 'agreed');
  };

  const getPaymentPendingTrainers = () => {
    return engagements.filter(e => e.stage === 'payment_pending');
  };

  const getActiveClients = () => {
    return engagements.filter(e => e.stage === 'active_client');
  };

  const isTrainerLiked = (trainerId: string) => {
    return getEngagementStage(trainerId) === 'liked';
  };

  const isTrainerShortlisted = (trainerId: string) => {
    const stage = getEngagementStage(trainerId);
    return stage === 'shortlisted' || stage === 'getting_to_know_your_coach' || stage === 'discovery_in_progress';
  };

  const likeTrainer = async (trainerId: string) => {
    await updateEngagementStage(trainerId, 'liked');
  };

  const shortlistTrainer = async (trainerId: string) => {
    await updateEngagementStage(trainerId, 'shortlisted');
  };

  const agreeWithTrainer = async (trainerId: string) => {
    await updateEngagementStage(trainerId, 'agreed');
  };

  const startPaymentProcess = async (trainerId: string) => {
    await updateEngagementStage(trainerId, 'payment_pending');
  };

  const proceedWithCoach = async (trainerId: string) => {
    await updateEngagementStage(trainerId, 'agreed');
  };

  const unmatchTrainer = async (trainerId: string) => {
    await updateEngagementStage(trainerId, 'unmatched');
  };

  const declineTrainer = async (trainerId: string) => {
    await updateEngagementStage(trainerId, 'declined');
  };

  const bookDiscoveryCall = async (trainerId: string) => {
    await updateEngagementStage(trainerId, 'getting_to_know_your_coach');
  };

  const completeDiscoveryCall = async (trainerId: string) => {
    await updateEngagementStage(trainerId, 'discovery_completed');
  };

  const rejectCoach = async (trainerId: string) => {
    await updateEngagementStage(trainerId, 'declined');
  };

  return {
    engagements,
    loading,
    updateEngagementStage,
    getEngagementStage,
    getLikedTrainers,
    getShortlistedTrainers,
    getOnlyShortlistedTrainers,
    getDiscoveryStageTrainers,
    getAgreedTrainers,
    getPaymentPendingTrainers,
    getActiveClients,
    isTrainerLiked,
    isTrainerShortlisted,
    likeTrainer,
    shortlistTrainer,
    agreeWithTrainer,
    startPaymentProcess,
    unmatchTrainer,
    declineTrainer,
    bookDiscoveryCall,
    completeDiscoveryCall,
    proceedWithCoach,
    rejectCoach,
    refresh: fetchEngagements
  };
}