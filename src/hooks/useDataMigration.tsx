import { useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAnonymousSession } from './useAnonymousSession';
import { useSavedTrainers } from './useSavedTrainers';
import { useClientProfile } from './useClientProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDataMigration() {
  const { user } = useAuth();
  const { getSessionData, clearSession } = useAnonymousSession();
  const { saveTrainer } = useSavedTrainers();
  const { profile } = useClientProfile();

  const migrateAnonymousData = useCallback(async () => {
    if (!user) return;

    const sessionData = getSessionData();
    if (!sessionData) return;

    try {
      let migratedCount = 0;

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
          // For now, we'll skip storing quiz results in profile 
          // since the profile structure doesn't have a metadata field
          // This can be enhanced later by adding a preferences table
          console.log('Quiz results migration skipped - no metadata field available');
        } catch (error) {
          console.error('Error updating profile with quiz results:', error);
        }
      }

      // Show success message if any data was migrated
      if (migratedCount > 0 || sessionData.quizResults) {
        const messages = [];
        if (migratedCount > 0) {
          messages.push(`${migratedCount} saved trainer${migratedCount > 1 ? 's' : ''}`);
        }
        if (sessionData.quizResults) {
          messages.push('your preferences');
        }

        toast({
          title: "Welcome back!",
          description: `We've restored ${messages.join(' and ')} to your account.`,
        });
      }

      // Clear anonymous session after successful migration
      clearSession();

    } catch (error) {
      console.error('Error during data migration:', error);
      toast({
        title: "Migration incomplete",
        description: "Some of your data couldn't be transferred. Don't worry, you can save trainers again.",
        variant: "destructive",
      });
    }
  }, [user, getSessionData, clearSession, saveTrainer, profile]);

  // Auto-migrate when user signs in/up
  useEffect(() => {
    if (user && getSessionData()) {
      // Small delay to ensure all hooks are ready
      setTimeout(() => {
        migrateAnonymousData();
      }, 1000);
    }
  }, [user, migrateAnonymousData]);

  return {
    migrateAnonymousData,
  };
}