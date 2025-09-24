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
            
            // Retry logic for when profile hasn't been created yet - reduce retries and delay
            if (retryCount < 1) { // Reduce from 3 to 1 retry
              console.log(`🔄 Retrying migration in 500ms (attempt ${retryCount + 1}/1)...`);
              setTimeout(() => {
                migrateAnonymousData(retryCount + 1);
              }, 500); // Reduce from 2000ms to 500ms
              return;
            } else {
              console.log('❌ Max retries reached, profile still not available');
              messages.push('quiz preferences (will be restored on next login)');
            }
          } else {
            try {
              console.log('📝 Migrating quiz results to client profile...');
              console.log('📋 Raw quiz results:', effectiveSessionData.quizResults);
              
              // Map anonymous quiz results to client profile format with comprehensive mapping
              const quizResults = effectiveSessionData.quizResults;
              const quizData = {
                quiz_completed: true,
                quiz_answers: quizResults,
                quiz_completed_at: new Date().toISOString(),
                
                // Goals - use both original and mapped properties
                primary_goals: quizResults.primary_goals || quizResults.goals || [],
                secondary_goals: quizResults.secondary_goals || [],
                
                // Location and format
                training_location_preference: quizResults.training_location_preference || quizResults.location || null,
                open_to_virtual_coaching: quizResults.open_to_virtual_coaching || false,
                
                // Scheduling and timing
                preferred_training_frequency: quizResults.preferred_training_frequency || 
                  (quizResults.availability ? String(quizResults.availability) : null),
                preferred_time_slots: quizResults.preferred_time_slots || [],
                start_timeline: quizResults.start_timeline || null,
                
                // Coaching style and motivation
                preferred_coaching_style: quizResults.preferred_coaching_style || quizResults.coachingStyle || [],
                motivation_factors: quizResults.motivation_factors || [],
                
                // Personal attributes
                client_personality_type: quizResults.client_personality_type || [],
                experience_level: quizResults.experience_level || 'beginner',
                
                // Budget - handle both string format and numeric format
                budget_range_min: quizResults.budget_range_min || null,
                budget_range_max: quizResults.budget_range_max || null,
                budget_flexibility: quizResults.budget_flexibility || 'flexible',
                
                // Equipment and lifestyle
                fitness_equipment_access: quizResults.fitness_equipment_access || [],
                lifestyle_description: quizResults.lifestyle_description || [],
                
                // Availability preferences
                waitlist_preference: quizResults.waitlist_preference ?? null,
                flexible_scheduling: quizResults.flexible_scheduling || false,
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
      
      // Reduce delay and add debouncing to prevent multiple calls
      setTimeout(() => {
        migrateAnonymousData(0, urlSessionId);
      }, 100);
    }
  }, [user, migrateAnonymousData, getSessionData, getTrainerSessionData, checkForSessionIdInUrl]);

  return {
    migrateAnonymousData,
    isMigrating,
    migrationCompleted,
  };
}