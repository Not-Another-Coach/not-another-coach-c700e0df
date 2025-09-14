import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useAnonymousSession } from './useAnonymousSession';
import { useAnonymousTrainerSession } from './useAnonymousTrainerSession';
import { useSavedTrainers } from './useSavedTrainers';
import { useClientProfile } from './useClientProfile';
import { useUserTypeChecks } from './useUserType';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDataMigration() {
  const { user } = useAuth();
  const { getSessionData, clearSession } = useAnonymousSession();
  const { getSessionData: getTrainerSessionData, clearSession: clearTrainerSession } = useAnonymousTrainerSession();
  const { saveTrainer } = useSavedTrainers();
  const { profile, updateProfile } = useClientProfile();
  const { isClient } = useUserTypeChecks();
  
  // Track migration state to prevent race conditions
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [migratedUserId, setMigratedUserId] = useState<string | null>(null);

  const migrateAnonymousData = useCallback(async (retryCount = 0) => {
    console.log('🔄 Starting anonymous data migration...', { user: !!user, retryCount, isClient: isClient() });
    
    if (!user) {
      console.log('❌ Migration aborted: No authenticated user');
      setMigrationCompleted(true);
      return;
    }

    // Only migrate for client users
    if (!isClient()) {
      console.log('❌ Migration skipped: User is not a client');
      setMigrationCompleted(true);
      return;
    }

    // Prevent multiple migrations for the same user
    if (migratedUserId === user.id) {
      console.log('❌ Migration skipped: Already migrated for this user');
      setMigrationCompleted(true);
      return;
    }
    
    setIsMigrating(true);

    const sessionData = getSessionData();
    const trainerSessionData = getTrainerSessionData();
    
    console.log('📋 Anonymous session data found:', {
      hasSessionData: !!sessionData,
      hasTrainerSessionData: !!trainerSessionData,
      savedTrainersCount: sessionData?.savedTrainers?.length || 0,
      hasQuizResults: !!sessionData?.quizResults
    });
    
    if (!sessionData && !trainerSessionData) {
      console.log('✅ Migration complete: No anonymous data to migrate');
      setIsMigrating(false);
      setMigrationCompleted(true);
      return;
    }

    try {
      let migratedCount = 0;
      const messages = [];

      // Migrate client session data
      if (sessionData) {
        // Migrate saved trainers silently
        if (sessionData.savedTrainers.length > 0) {
          for (const trainerId of sessionData.savedTrainers) {
            try {
              const success = await saveTrainer(trainerId, 'Migrated from anonymous session', { silent: true });
              if (success) {
                migratedCount++;
              }
            } catch (error) {
              console.error('Error migrating trainer:', trainerId, error);
            }
          }
        }

        // Migrate quiz results to profile if client and quiz exists
        if (sessionData.quizResults) {
          console.log('🧠 Found quiz results to migrate:', sessionData.quizResults);
          
          if (!profile) {
            console.log('⏳ Client profile not yet available, checking if we should retry...');
            
            // Retry logic for when profile hasn't been created yet
            if (retryCount < 3) {
              console.log(`🔄 Retrying migration in 2 seconds (attempt ${retryCount + 1}/3)...`);
              setTimeout(() => {
                migrateAnonymousData(retryCount + 1);
              }, 2000);
              return;
            } else {
              console.log('❌ Max retries reached, profile still not available');
              messages.push('quiz preferences (will be restored on next login)');
            }
          } else {
            try {
              console.log('📝 Migrating quiz results to client profile...');
              
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
              
              console.log('📤 Updating profile with quiz data:', quizData);
              
              // Update profile with quiz results
              await updateProfile(quizData);
              console.log('✅ Quiz results migrated to client profile successfully');
              messages.push('your preferences');
            } catch (error) {
              console.error('❌ Error updating profile with quiz results:', error);
              // Don't fail the whole migration for this
              messages.push('quiz preferences (partially restored)');
            }
          }
        } else {
          console.log('ℹ️ No quiz results found in session data');
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

      // Migration completed silently - no toasts to prevent spam

      // Clear anonymous sessions after successful migration
      if (sessionData) {
        console.log('🗑️ Clearing anonymous client session...');
        clearSession();
      }
      if (trainerSessionData) {
        console.log('🗑️ Clearing anonymous trainer session...');
        clearTrainerSession();
      }
      
      setIsMigrating(false);
      setMigrationCompleted(true);
      setMigratedUserId(user.id);
      console.log('✅ Migration fully completed');

    } catch (error) {
      setIsMigrating(false);
      setMigrationCompleted(true);
      console.error('Error during data migration:', error);
      // Silent migration - no error toasts to prevent spam
    }
  }, [user, getSessionData, getTrainerSessionData, clearSession, clearTrainerSession, saveTrainer, profile, updateProfile, isClient, migratedUserId]);

  // Reset migration state when user changes
  useEffect(() => {
    if (!user) {
      setIsMigrating(false);
      setMigrationCompleted(false);
      setMigratedUserId(null);
    }
  }, [user]);

  // Auto-migrate when user signs in/up
  useEffect(() => {
    if (user && (getSessionData() || getTrainerSessionData())) {
      console.log('🚀 User authenticated with anonymous data available, starting migration...');
      // Small delay to ensure all hooks are ready
      setTimeout(() => {
        migrateAnonymousData(0);
      }, 1000);
    }
  }, [user, migrateAnonymousData, getSessionData, getTrainerSessionData]);

  return {
    migrateAnonymousData,
    isMigrating,
    migrationCompleted,
  };
}