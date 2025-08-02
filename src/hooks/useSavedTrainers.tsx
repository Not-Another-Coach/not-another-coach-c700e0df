import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
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
  const [savedTrainers, setSavedTrainers] = useState<SavedTrainer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved trainers for the current user
  const fetchSavedTrainers = async () => {
    if (!user) {
      setSavedTrainers([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_trainers')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setSavedTrainers(data || []);
    } catch (error) {
      console.error('Error fetching saved trainers:', error);
      toast({
        title: "Error",
        description: "Failed to load saved trainers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save a trainer
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
      const { error } = await supabase
        .from('saved_trainers')
        .insert({
          user_id: user.id,
          trainer_id: trainerId,
          notes,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already saved",
            description: "This trainer is already in your saved list",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      await fetchSavedTrainers(); // Refresh the list
      
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

  // Remove a saved trainer
  const unsaveTrainer = async (trainerId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_trainers')
        .delete()
        .eq('user_id', user.id)
        .eq('trainer_id', trainerId);

      if (error) throw error;

      await fetchSavedTrainers(); // Refresh the list
      toast({
        title: "Trainer removed",
        description: "Removed from your saved trainers list",
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

  // Check if a trainer is saved
  const isTrainerSaved = (trainerId: string) => {
    return savedTrainers.some(saved => saved.trainer_id === trainerId);
  };

  // Get saved trainer IDs for quick lookup
  const savedTrainerIds = savedTrainers.map(saved => saved.trainer_id);

  useEffect(() => {
    fetchSavedTrainers();
  }, [user]);

  return {
    savedTrainers,
    loading,
    saveTrainer,
    unsaveTrainer,
    isTrainerSaved,
    savedTrainerIds,
    refetch: fetchSavedTrainers,
  };
};