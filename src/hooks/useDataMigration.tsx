import { useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAnonymousSession } from './useAnonymousSession';
import { useAnonymousTrainerSession } from './useAnonymousTrainerSession';
import { useSavedTrainers } from './useSavedTrainers';
import { useClientProfile } from './useClientProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDataMigration() {
  const { user } = useAuth();
  const { getSessionData, clearSession } = useAnonymousSession();
  const { getSessionData: getTrainerSessionData, clearSession: clearTrainerSession } = useAnonymousTrainerSession();
  const { saveTrainer } = useSavedTrainers();
  const { profile, updateProfile } = useClientProfile();

  const migrateAnonymousData = useCallback(async () => {
    if (!user) return;

    const sessionData = getSessionData();
    const trainerSessionData = getTrainerSessionData();
    
    if (!sessionData && !trainerSessionData) return;

    try {
      let migratedCount = 0;
      const messages = [];

      // Migrate client session data
      if (sessionData) {
        // Migrate saved trainers
        if (sessionData.savedTrainers.length > 0) {
          for (const trainerId of sessionData.savedTrainers) {
            try {
              const success = await saveTrainer(trainerId, 'Migrated from anonymous session');
              if (success) {
                migratedCount++;
              }
            } catch (error) {
              console.error('Error migrating trainer:', trainerId, error);
            }
          }
        }

        // Migrate quiz results to profile if client and quiz exists
        if (sessionData.quizResults && profile && user) {
          try {
            // Map anonymous quiz results to client profile format
            const quizData = {
              quiz_completed: true,
              quiz_answers: sessionData.quizResults,
              quiz_completed_at: new Date().toISOString(),
              // Map quiz results to survey fields for immediate use
              primary_goals: sessionData.quizResults.goals || [],
              training_location_preference: sessionData.quizResults.location || null,
              preferred_coaching_style: sessionData.quizResults.coachingStyle || [],
              preferred_training_frequency: sessionData.quizResults.availability || null,
            };
            
            // Update profile with quiz results
            await updateProfile(quizData);
            console.log('Quiz results migrated to client profile successfully');
          } catch (error) {
            console.error('Error updating profile with quiz results:', error);
          }
        }

        if (migratedCount > 0) {
          messages.push(`${migratedCount} saved trainer${migratedCount > 1 ? 's' : ''}`);
        }
        if (sessionData.quizResults) {
          messages.push('your preferences');
        }
      }

      // Migrate trainer session data
      if (trainerSessionData && trainerSessionData.trainerProfile) {
        try {
          // Store trainer profile data temporarily for profile setup
          const profileData = trainerSessionData.trainerProfile;
          
          // You could store this in localStorage with a different key for trainer profile setup
          if (Object.keys(profileData).length > 0) {
            localStorage.setItem('nac_trainer_profile_draft', JSON.stringify(profileData));
            messages.push('your trainer profile draft');
          }
        } catch (error) {
          console.error('Error migrating trainer profile data:', error);
        }
      }

      // Show success message if any data was migrated
      if (messages.length > 0) {
        toast({
          title: "Welcome back!",
          description: `We've restored ${messages.join(' and ')} to your account.`,
        });
      }

      // Clear anonymous sessions after successful migration
      if (sessionData) clearSession();
      if (trainerSessionData) clearTrainerSession();

    } catch (error) {
      console.error('Error during data migration:', error);
      toast({
        title: "Migration incomplete",
        description: "Some of your data couldn't be transferred. Don't worry, you can save your information again.",
        variant: "destructive",
      });
    }
  }, [user, getSessionData, getTrainerSessionData, clearSession, clearTrainerSession, saveTrainer, profile, updateProfile]);

  // Auto-migrate when user signs in/up
  useEffect(() => {
    if (user && (getSessionData() || getTrainerSessionData())) {
      // Small delay to ensure all hooks are ready
      setTimeout(() => {
        migrateAnonymousData();
      }, 1000);
    }
  }, [user, migrateAnonymousData, getSessionData, getTrainerSessionData]);

  return {
    migrateAnonymousData,
  };
}