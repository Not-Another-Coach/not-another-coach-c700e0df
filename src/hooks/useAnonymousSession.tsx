import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnonymousSession {
  sessionId: string;
  savedTrainers: string[];
  quizResults?: {
    goals: string[];
    budget: string;
    coachingStyle: string[];
    availability: string;
    location: string;
    // Extended fields for client survey compatibility
    primary_goals?: string[];
    secondary_goals?: string[];
    budget_range_min?: number | null;
    budget_range_max?: number | null;
    budget_flexibility?: string;
    preferred_coaching_style?: string[];
    preferred_training_frequency?: number;
    preferred_time_slots?: string[];
    start_timeline?: string;
    training_location_preference?: string;
    open_to_virtual_coaching?: boolean;
  };
  createdAt: string;
  expiresAt: string;
}

const ANONYMOUS_SESSION_KEY = 'nac_anonymous_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_EVENT = 'anonymous-session-updated';

export function useAnonymousSession() {
  const [session, setSession] = useState<AnonymousSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate new session ID
  const generateSessionId = () => {
    const sessionId = 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    console.log('🆔 Generated new session ID:', sessionId);
    return sessionId;
  };

  // Sync session data to server
  const syncToServer = useCallback(async (sessionData: AnonymousSession) => {
    console.log('🔄 SYNC: Starting syncToServer for session:', sessionData.sessionId);
    console.log('🔄 SYNC: Session data to sync:', {
      sessionId: sessionData.sessionId,
      trainersCount: sessionData.savedTrainers.length,
      hasQuizResults: !!sessionData.quizResults,
      expiresAt: sessionData.expiresAt
    });
    
    try {
      // Validate session before syncing
      const expiresAt = new Date(sessionData.expiresAt);
      if (expiresAt < new Date()) {
        console.warn('🔄 SYNC: Session expired, skipping sync');
        return;
      }
      
      console.log('🔄 SYNC: Parsed expires date:', expiresAt.toISOString());
      
      const payload = {
        session_id: sessionData.sessionId,
        saved_trainers: sessionData.savedTrainers,
        quiz_results: sessionData.quizResults || null,
        expires_at: expiresAt.toISOString(),
      };
      console.log('🔄 SYNC: Supabase payload:', payload);
      
      const { data, error } = await supabase
        .from('anonymous_sessions')
        .upsert(payload, {
          onConflict: 'session_id'
        });
      
      if (error) {
        // Handle permission errors gracefully
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('🔄 SYNC: Session access denied, continuing with local storage only');
          return;
        }
        console.error('🔄 SYNC: Supabase error:', error);
        throw error;
      }
      
      console.log('✅ SYNC: Successfully synced to server:', data);
    } catch (error) {
      console.error('❌ SYNC: Error syncing anonymous session to server:', error);
      console.error('❌ SYNC: Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      // Don't throw - this is a background sync, localStorage is the primary storage
    }
  }, []);

  // Load session data from server
  const loadFromServer = useCallback(async (sessionId: string) => {
    console.log('🔍 LOAD: Attempting to load session from server:', sessionId);
    
    try {
      // Validate session ID format
      if (!sessionId || sessionId.length < 10) {
        console.warn('🔍 LOAD: Invalid session ID format');
        return null;
      }

      const currentTime = new Date().toISOString();
      console.log('🔍 LOAD: Current time for expiry check:', currentTime);
      
      const { data, error } = await supabase
        .from('anonymous_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .gt('expires_at', currentTime)
        .maybeSingle();

      console.log('🔍 LOAD: Supabase response:', { data, error });

      if (error) {
        // Handle permission errors gracefully
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('🔍 LOAD: Session access denied, using local storage only');
          return null;
        }
        console.log('🔍 LOAD: Query error or no data found:', error);
        return null;
      }
      
      if (!data) {
        console.log('🔍 LOAD: No data returned from query');
        return null;
      }

      const sessionData = {
        sessionId: data.session_id,
        savedTrainers: data.saved_trainers || [],
        quizResults: data.quiz_results,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
      } as AnonymousSession;
      
      console.log('✅ LOAD: Successfully loaded session from server:', sessionData);
      return sessionData;
    } catch (error) {
      console.error('❌ LOAD: Error loading anonymous session from server:', error);
      console.error('❌ LOAD: Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      return null;
    }
  }, []);

  // Initialize or load existing session
  useEffect(() => {
    const initializeSession = async () => {
      console.log('🚀 INIT: Initializing anonymous session');
      const savedSession = localStorage.getItem(ANONYMOUS_SESSION_KEY);
      console.log('🚀 INIT: localStorage data:', savedSession ? 'FOUND' : 'NOT FOUND');
      
      if (savedSession) {
        try {
          const parsed: AnonymousSession = JSON.parse(savedSession);
          console.log('🚀 INIT: Parsed session from localStorage:', {
            sessionId: parsed.sessionId,
            hasQuizResults: !!parsed.quizResults,
            trainersCount: parsed.savedTrainers?.length || 0,
            expiresAt: parsed.expiresAt
          });
          
          // Check if session is expired
          const now = new Date();
          const expiresAt = new Date(parsed.expiresAt);
          console.log('🚀 INIT: Expiry check - now:', now.toISOString(), 'expires:', expiresAt.toISOString());
          
          if (expiresAt > now) {
            console.log('🚀 INIT: Session is valid, checking server for updates');
            // Try to load more recent data from server
            const serverSession = await loadFromServer(parsed.sessionId);
            if (serverSession) {
              console.log('🔄 INIT: Loaded updated session data from server');
              setSession(serverSession);
              localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(serverSession));
            } else {
              console.log('🔄 INIT: No server data found, using localStorage session');
              setSession(parsed);
            }
          } else {
            console.log('🚀 INIT: Session expired, cleaning up');
            // Clean up expired session
            localStorage.removeItem(ANONYMOUS_SESSION_KEY);
            setSession(null);
          }
        } catch (error) {
          console.error('❌ INIT: Error parsing anonymous session:', error);
          localStorage.removeItem(ANONYMOUS_SESSION_KEY);
          setSession(null);
        }
      } else {
        console.log('🚀 INIT: No existing session found');
        setSession(null);
      }
      
      console.log('🚀 INIT: Initialization complete, setting loading to false');
      setLoading(false);
    };

    initializeSession();
  }, [loadFromServer]);

  // Sync across multiple hook instances using a custom event and storage listener
  useEffect(() => {
    const handleSessionSync = () => {
      console.log('🔄 EVENT: Session sync event triggered');
      try {
        const saved = localStorage.getItem(ANONYMOUS_SESSION_KEY);
        console.log('🔄 EVENT: localStorage content:', saved ? 'FOUND' : 'NOT FOUND');
        
        if (saved) {
          const parsed: AnonymousSession = JSON.parse(saved);
          console.log('🔄 EVENT: Parsed session from sync:', {
            sessionId: parsed.sessionId,
            hasQuizResults: !!parsed.quizResults,
            trainersCount: parsed.savedTrainers?.length || 0
          });
          setSession(parsed);
        } else {
          console.log('🔄 EVENT: No session data found, setting to null');
          setSession(null);
        }
      } catch (e) {
        console.error('❌ EVENT: Error syncing anonymous session:', e);
      }
    };
    
    console.log('🔄 EVENT: Setting up session event listeners');
    window.addEventListener(SESSION_EVENT, handleSessionSync as EventListener);
    window.addEventListener('storage', handleSessionSync as EventListener);
    
    return () => {
      console.log('🔄 EVENT: Cleaning up session event listeners');
      window.removeEventListener(SESSION_EVENT, handleSessionSync as EventListener);
      window.removeEventListener('storage', handleSessionSync as EventListener);
    };
  }, []);

  // Create new anonymous session
  const createSession = useCallback(() => {
    console.log('🆕 CREATE: Creating new anonymous session');
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION);
    const sessionId = generateSessionId();
    
    console.log('🆕 CREATE: Session details:', {
      sessionId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      sessionDuration: SESSION_DURATION
    });
    
    const newSession: AnonymousSession = {
      sessionId,
      savedTrainers: [],
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    console.log('🆕 CREATE: Setting session in state and localStorage');
    setSession(newSession);
    localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(newSession));
    console.log('🆕 CREATE: Dispatching session event');
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
    
    // Sync to server in background
    console.log('🆕 CREATE: Initiating background sync to server');
    syncToServer(newSession);
    
    console.log('✅ CREATE: Session created successfully:', sessionId);
    return newSession;
  }, [syncToServer]);

  // Save trainer to anonymous session
  const saveTrainer = useCallback((trainerId: string) => {
    const currentSession = session || createSession();
    
    // Check if trainer is already saved
    if (currentSession.savedTrainers.includes(trainerId)) {
      return false;
    }
    
    // Check 5-trainer limit for anonymous users
    if (currentSession.savedTrainers.length >= 5) {
      return false;
    }
    
    const updatedSession = {
      ...currentSession,
      savedTrainers: [...currentSession.savedTrainers, trainerId],
    };
    
    setSession(updatedSession);
    localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(updatedSession));
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
    
    // Sync to server in background
    syncToServer(updatedSession);
    
    return true;
  }, [session, createSession, syncToServer]);

  // Remove trainer from anonymous session
  const unsaveTrainer = useCallback((trainerId: string) => {
    if (!session) return;
    
    const updatedSession = {
      ...session,
      savedTrainers: session.savedTrainers.filter(id => id !== trainerId),
    };
    
    setSession(updatedSession);
    localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(updatedSession));
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
    
    // Sync to server in background
    syncToServer(updatedSession);
  }, [session, syncToServer]);

  // Save quiz results
  const saveQuizResults = useCallback((results: any) => {
    console.log('💾 QUIZ: Starting saveQuizResults with data:', results);
    console.log('💾 QUIZ: Current session state:', session ? {
      sessionId: session.sessionId,
      hasQuizResults: !!session.quizResults,
      trainersCount: session.savedTrainers.length
    } : 'NO SESSION');
    
    let currentSession = session;
    if (!currentSession) {
      console.log('💾 QUIZ: No existing session, creating new one');
      currentSession = createSession();
    } else {
      console.log('💾 QUIZ: Using existing session:', currentSession.sessionId);
    }
    
    const updatedSession = {
      ...currentSession,
      quizResults: results,
    };
    
    console.log('💾 QUIZ: Updated session object:', {
      sessionId: updatedSession.sessionId,
      quizResultsKeys: Object.keys(updatedSession.quizResults || {}),
      trainersCount: updatedSession.savedTrainers.length,
      expiresAt: updatedSession.expiresAt
    });
    
    console.log('💾 QUIZ: Setting session in state');
    setSession(updatedSession);
    
    console.log('💾 QUIZ: Saving to localStorage');
    try {
      localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(updatedSession));
      console.log('✅ QUIZ: Successfully saved to localStorage');
    } catch (error) {
      console.error('❌ QUIZ: Error saving to localStorage:', error);
    }
    
    console.log('💾 QUIZ: Dispatching session update event');
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
    
    // Sync to server in background
    console.log('💾 QUIZ: Starting background sync to server');
    syncToServer(updatedSession);
    
    console.log('✅ QUIZ: saveQuizResults completed successfully');
  }, [session, createSession, syncToServer]);

  // Clear session (on account creation)
  const clearSession = useCallback(async () => {
    const currentSession = session;
    setSession(null);
    localStorage.removeItem(ANONYMOUS_SESSION_KEY);
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
    
    // Clean up from server as well
    if (currentSession) {
      try {
        await supabase
          .from('anonymous_sessions')
          .delete()
          .eq('session_id', currentSession.sessionId);
        console.log('🗑️ Anonymous session cleaned up from server');
      } catch (error) {
        console.error('Error cleaning up server session:', error);
      }
    }
  }, [session]);

  // Get session data for account migration
  const getSessionData = useCallback(() => {
    return session;
  }, [session]);

  // Load session by ID (for cross-device access)
  const loadSessionById = useCallback(async (sessionId: string) => {
    try {
      console.log('🔍 Loading session from server:', sessionId);
      const serverSession = await loadFromServer(sessionId);
      
      if (serverSession) {
        console.log('✅ Session loaded from server successfully');
        setSession(serverSession);
        localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(serverSession));
        window.dispatchEvent(new CustomEvent(SESSION_EVENT));
        return serverSession;
      }
      
      console.log('❌ Session not found on server');
      return null;
    } catch (error) {
      console.error('Error loading session by ID:', error);
      return null;
    }
  }, [loadFromServer]);

  return {
    session,
    loading,
    createSession,
    saveTrainer,
    canSaveMoreTrainers: session ? session.savedTrainers.length < 5 : true,
    savedTrainerIds: session?.savedTrainers || [],
    unsaveTrainer,
    saveQuizResults,
    clearSession,
    getSessionData,
    loadSessionById,
    isTrainerSaved: (trainerId: string) => session?.savedTrainers.includes(trainerId) ?? false,
    savedTrainersCount: session?.savedTrainers.length ?? 0,
  };
}