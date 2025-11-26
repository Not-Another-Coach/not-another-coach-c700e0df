import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { useTrainerEngagement } from '@/hooks/useTrainerEngagement';
import { useWaitlist } from '@/hooks/useWaitlist';
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
  
  const [loading, setLoading] = useState(true);

  // Only for authenticated users - anonymous sessions removed
  const savedTrainers = user 
    ? getLikedTrainers().map(engagement => ({
        id: engagement.trainerId,
        trainer_id: engagement.trainerId,
        saved_at: engagement.createdAt,
        notes: engagement.notes
      }))
    : [];

  useEffect(() => {
    setLoading(false);
  }, []);

  // Save a trainer - authenticated users only
  const saveTrainer = async (trainerId: string, notes?: string, options?: { silent?: boolean }) => {
    const silent = options?.silent || false;
    
    if (!user) {
      toast.error("Please sign in to save trainers");
      return false;
    }

    try {
      console.log('Saving trainer:', trainerId);
      await engagementLikeTrainer(trainerId);
      // Notify other components for instant removal from explore views
      window.dispatchEvent(new CustomEvent('engagementStageUpdated', { detail: { trainerId, stage: 'liked' } }));
      
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

  // Remove a saved trainer - authenticated users only
  const unsaveTrainer = async (trainerId: string) => {
    if (!user) {
      toast.error("Please sign in to manage saved trainers");
      return false;
    }

    try {
      console.log('Unsaving trainer:', trainerId);
      // Move back to browsing stage when unsaving
      await updateEngagementStage(trainerId, 'browsing');
      
      // Notify other hooks/components for instant UI updates
      window.dispatchEvent(new CustomEvent('engagementStageUpdated', { detail: { trainerId, stage: 'browsing' } }));
      
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

  // Check if a trainer is saved - authenticated users only
  const isTrainerSaved = (trainerId: string) => {
    if (!user) return false;
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
