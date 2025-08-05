import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { useTrainerEngagement } from '@/hooks/useTrainerEngagement';
import { useWaitlist } from '@/hooks/useWaitlist';
import { toast } from '@/hooks/use-toast';

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

  // Map engagement data to saved trainers format
  const savedTrainers = getLikedTrainers().map(engagement => ({
    id: engagement.trainerId,
    trainer_id: engagement.trainerId,
    saved_at: engagement.createdAt,
    notes: engagement.notes
  }));

  useEffect(() => {
    setLoading(false);
  }, []);

  // Save a trainer using the engagement system
  const saveTrainer = async (trainerId: string, notes?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save trainers",
        variant: "destructive",
      });
      return false;
    }

    try {
      await engagementLikeTrainer(trainerId);
      
      // Track progress - first save advances to shortlisting stage
      if (savedTrainers.length === 0) {
        await advanceToStage('shortlisting');
        await updateProgress('shortlisting', 'first_save', { trainerId });
      } else {
        await updateProgress('shortlisting', 'save_trainer', { trainerId });
      }
      
      toast({
        title: "Trainer saved!",
        description: "Added to your saved trainers list",
      });
      return true;
    } catch (error) {
      console.error('Error saving trainer:', error);
      toast({
        title: "Error",
        description: "Failed to save trainer",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove a saved trainer using the engagement system
  const unsaveTrainer = async (trainerId: string) => {
    if (!user) return false;

    try {
      // Move back to browsing stage when unsaving
      await updateEngagementStage(trainerId, 'browsing');
      
      // Also remove from waitlist if they're on one (per spec requirement)
      await removeFromWaitlist(trainerId);
      
      toast({
        title: "Trainer removed",
        description: "Removed from your saved trainers list and any waitlists",
      });
      return true;
    } catch (error) {
      console.error('Error removing saved trainer:', error);
      toast({
        title: "Error",
        description: "Failed to remove trainer",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check if a trainer is saved (liked)
  const isTrainerSaved = (trainerId: string) => {
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