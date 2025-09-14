import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { useTrainerEngagement } from '@/hooks/useTrainerEngagement';
import { useWaitlist } from '@/hooks/useWaitlist';
import { useAnonymousSession } from '@/hooks/useAnonymousSession';
import { toast } from 'sonner';

export interface SavedTrainer {
  id: string;
  trainer_id: string;
  saved_at: string;
  notes?: string;
}

export const useSavedTrainers = () => {
  const { user } = useAuth();
  const { updateProgress, advanceToStage } = useJourneyProgress();
  const { 
    getLikedTrainers, 
    likeTrainer: engagementLikeTrainer,
    updateEngagementStage,
    getEngagementStage 
  } = useTrainerEngagement();
  const { removeFromWaitlist } = useWaitlist();
  const anonymousSession = useAnonymousSession();
  
  const [loading, setLoading] = useState(true);

  // For authenticated users, use engagement data
  // For anonymous users, use anonymous session data
  const savedTrainers = user 
    ? getLikedTrainers().map(engagement => ({
        id: engagement.trainerId,
        trainer_id: engagement.trainerId,
        saved_at: engagement.createdAt,
        notes: engagement.notes
      }))
    : (anonymousSession.savedTrainerIds || []).map(trainerId => ({
        id: trainerId,
        trainer_id: trainerId,
        saved_at: new Date().toISOString(),
        notes: undefined
      }));

  useEffect(() => {
    setLoading(false);
  }, []);

  // Save a trainer - handles both authenticated and anonymous users
  const saveTrainer = async (trainerId: string, notes?: string, options?: { silent?: boolean }) => {
    const silent = options?.silent || false;
    
    if (!user) {
      // Anonymous user - use anonymous session
      anonymousSession.saveTrainer(trainerId);
      if (!silent) {
        toast.success("Trainer saved! Create an account to keep them forever");
      }
      return true;
    }

    try {
      console.log('Saving trainer:', trainerId);
      await engagementLikeTrainer(trainerId);
      
      // Track progress - first save advances to shortlisting stage
      if (savedTrainers.length === 0 && !silent) {
        await advanceToStage('shortlisting');
        await updateProgress('shortlisting', 'first_save', { trainerId });
      } else if (!silent) {
        await updateProgress('shortlisting', 'save_trainer', { trainerId });
      }
      
      if (!silent) {
        toast.success("Trainer saved! Added to your saved trainers list");
      }
      console.log('Trainer saved successfully:', trainerId);
      return true;
    } catch (error) {
      console.error('Error saving trainer:', error);
      if (!silent) {
        toast.error("Failed to save trainer");
      }
      return false;
    }
  };

  // Remove a saved trainer - handles both authenticated and anonymous users
  const unsaveTrainer = async (trainerId: string) => {
    if (!user) {
      // Anonymous user - use anonymous session
      anonymousSession.unsaveTrainer(trainerId);
      toast.success("Trainer removed from your saved trainers");
      return true;
    }

    try {
      console.log('Unsaving trainer:', trainerId);
      // Move back to browsing stage when unsaving
      await updateEngagementStage(trainerId, 'browsing');
      
      // Also remove from waitlist if they're on one (per spec requirement)
      await removeFromWaitlist(trainerId);
      
      toast.success("Trainer removed from your saved trainers list and any waitlists");
      console.log('Trainer unsaved successfully:', trainerId);
      return true;
    } catch (error) {
      console.error('Error removing saved trainer:', error);
      toast.error("Failed to remove trainer");
      return false;
    }
  };

  // Check if a trainer is saved - handles both authenticated and anonymous users
  const isTrainerSaved = (trainerId: string) => {
    if (!user) {
      // Anonymous user - check anonymous session using reactive savedTrainerIds
      return anonymousSession.savedTrainerIds.includes(trainerId);
    }
    return getEngagementStage(trainerId) === 'liked';
  };

  // Get saved trainer IDs for quick lookup
  const savedTrainerIds = savedTrainers.map(saved => saved.trainer_id);

  return {
    savedTrainers,
    loading,
    saveTrainer,
    unsaveTrainer,
    isTrainerSaved,
    savedTrainerIds,
    refetch: () => {}, // Engagement hook handles refetching
  };
};