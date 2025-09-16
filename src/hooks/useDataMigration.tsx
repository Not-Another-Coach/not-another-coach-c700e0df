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
  const { getSessionData, clearSession, loadSessionById } = useAnonymousSession();
  const { getSessionData: getTrainerSessionData, clearSession: clearTrainerSession } = useAnonymousTrainerSession();
  const { saveTrainer } = useSavedTrainers();
  const { profile, updateProfile } = useClientProfile();
  const { isClient } = useUserTypeChecks();
  
  // Track migration state to prevent race conditions
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [migratedUserId, setMigratedUserId] = useState<string | null>(null);

  // Check for session ID in URL (from email confirmation)
  const checkForSessionIdInUrl = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id') || urlParams.get('anonymous_session');
    
    if (sessionId) {
      console.log('🔗 Found session ID in URL:', sessionId);
      // Remove from URL to prevent re-processing
      urlParams.delete('session_id');
      urlParams.delete('anonymous_session');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      
      return sessionId;
    }
    
    return null;
  }, []);

  const migrateAnonymousData = useCallback(async (retryCount = 0, urlSessionId?: string) => {
    console.log('🔄 Starting anonymous data migration...', { 
      user: !!user, 
      retryCount, 
      isClient: isClient(),
      urlSessionId: !!urlSessionId 
    });
    
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
    
    // If we have a session ID from URL (cross-device scenario), try to load that session
    let crossDeviceSessionData = null;
    if (urlSessionId) {
      try {
        console.log('🔄 Loading cross-device session data...');
        crossDeviceSessionData = await loadSessionById(urlSessionId);
        if (crossDeviceSessionData) {
          console.log('✅ Cross-device session data loaded successfully');
        }
      } catch (error) {
        console.error('Error loading cross-device session:', error);
      }
    }
    
    // Use cross-device data if available, otherwise use local data
    const effectiveSessionData = crossDeviceSessionData || sessionData;
    
    console.log('📋 Anonymous session data found:', {
      hasLocalSessionData: !!sessionData,
      hasCrossDeviceSessionData: !!crossDeviceSessionData,
      hasTrainerSessionData: !!trainerSessionData,
      savedTrainersCount: effectiveSessionData?.savedTrainers?.length || 0,
      hasQuizResults: !!effectiveSessionData?.quizResults
    });
    
    if (!effectiveSessionData && !trainerSessionData) {
      console.log('✅ Migration complete: No anonymous data to migrate');
      setIsMigrating(false);
      setMigrationCompleted(true);
      return;
    }

    try {
      let migratedCount = 0;
      const messages = [];

      // Migrate client session data
      if (effectiveSessionData) {
        // Show success message for cross-device migration
        if (crossDeviceSessionData) {
          messages.push('your data from the other device');
        }
        
        // Migrate saved trainers silently
        if (effectiveSessionData.savedTrainers.length > 0) {
          for (const trainerId of effectiveSessionData.savedTrainers) {
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
        if (effectiveSessionData.quizResults) {
          console.log('🧠 Found quiz results to migrate:', effectiveSessionData.quizResults);
          
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
                quiz_answers: effectiveSessionData.quizResults,
                quiz_completed_at: new Date().toISOString(),
                // Map quiz results to survey fields for immediate use
                primary_goals: effectiveSessionData.quizResults.goals || [],
                training_location_preference: effectiveSessionData.quizResults.location || null,
                preferred_coaching_style: effectiveSessionData.quizResults.coachingStyle || [],
                preferred_training_frequency: effectiveSessionData.quizResults.availability || null,
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
      if (effectiveSessionData) {
        console.log('🗑️ Clearing anonymous client session...');
        // If we used cross-device data, clear the server session
        if (crossDeviceSessionData) {
          try {
            await supabase
              .from('anonymous_sessions')
              .delete()
              .eq('session_id', crossDeviceSessionData.sessionId);
            console.log('🗑️ Cross-device session cleared from server');
          } catch (error) {
            console.error('Error clearing cross-device session:', error);
          }
        } else {
          // Clear local session normally
          clearSession();
        }
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
  }, [user, getSessionData, getTrainerSessionData, clearSession, clearTrainerSession, saveTrainer, profile, updateProfile, isClient, migratedUserId, loadSessionById]);

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
      
      // Check for session ID in URL first (cross-device scenario)
      const urlSessionId = checkForSessionIdInUrl();
      
      // Small delay to ensure all hooks are ready
      setTimeout(() => {
        migrateAnonymousData(0, urlSessionId);
      }, 1000);
    }
  }, [user, migrateAnonymousData, getSessionData, getTrainerSessionData, checkForSessionIdInUrl]);

  return {
    migrateAnonymousData,
    isMigrating,
    migrationCompleted,
  };
}