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
    return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  // Sync session data to server
  const syncToServer = useCallback(async (sessionData: AnonymousSession) => {
    try {
      const expiresAt = new Date(sessionData.expiresAt);
      
      await supabase
        .from('anonymous_sessions')
        .upsert({
          session_id: sessionData.sessionId,
          saved_trainers: sessionData.savedTrainers,
          quiz_results: sessionData.quizResults || null,
          expires_at: expiresAt.toISOString(),
        }, {
          onConflict: 'session_id'
        });
    } catch (error) {
      console.error('Error syncing anonymous session to server:', error);
      // Don't throw - this is a background sync, localStorage is the primary storage
    }
  }, []);

  // Load session data from server
  const loadFromServer = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('anonymous_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      return {
        sessionId: data.session_id,
        savedTrainers: data.saved_trainers || [],
        quizResults: data.quiz_results,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
      } as AnonymousSession;
    } catch (error) {
      console.error('Error loading anonymous session from server:', error);
      return null;
    }
  }, []);

  // Initialize or load existing session
  useEffect(() => {
    const initializeSession = async () => {
      const savedSession = localStorage.getItem(ANONYMOUS_SESSION_KEY);
      
      if (savedSession) {
        try {
          const parsed: AnonymousSession = JSON.parse(savedSession);
          
          // Check if session is expired
          if (new Date(parsed.expiresAt) > new Date()) {
            // Try to load more recent data from server
            const serverSession = await loadFromServer(parsed.sessionId);
            if (serverSession) {
              console.log('🔄 Loaded updated session data from server');
              setSession(serverSession);
              localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(serverSession));
            } else {
              setSession(parsed);
            }
          } else {
            // Clean up expired session
            localStorage.removeItem(ANONYMOUS_SESSION_KEY);
          }
        } catch (error) {
          console.error('Error parsing anonymous session:', error);
          localStorage.removeItem(ANONYMOUS_SESSION_KEY);
        }
      }
      
      setLoading(false);
    };

    initializeSession();
  }, [loadFromServer]);

  // Sync across multiple hook instances using a custom event and storage listener
  useEffect(() => {
    const handleSessionSync = () => {
      try {
        const saved = localStorage.getItem(ANONYMOUS_SESSION_KEY);
        if (saved) {
          const parsed: AnonymousSession = JSON.parse(saved);
          setSession(parsed);
        } else {
          setSession(null);
        }
      } catch (e) {
        console.error('Error syncing anonymous session:', e);
      }
    };
    window.addEventListener(SESSION_EVENT, handleSessionSync as EventListener);
    window.addEventListener('storage', handleSessionSync as EventListener);
    return () => {
      window.removeEventListener(SESSION_EVENT, handleSessionSync as EventListener);
      window.removeEventListener('storage', handleSessionSync as EventListener);
    };
  }, []);

  // Create new anonymous session
  const createSession = useCallback(() => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION);
    
    const newSession: AnonymousSession = {
      sessionId: generateSessionId(),
      savedTrainers: [],
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    setSession(newSession);
    localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(newSession));
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
    
    // Sync to server in background
    syncToServer(newSession);
    
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
  const saveQuizResults = useCallback((results: AnonymousSession['quizResults']) => {
    console.log('💾 Saving anonymous quiz results:', results);
    
    const currentSession = session || createSession();
    
    const updatedSession = {
      ...currentSession,
      quizResults: results,
    };
    
    console.log('📝 Updating anonymous session with quiz results');
    setSession(updatedSession);
    localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(updatedSession));
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
    
    // Sync to server in background
    syncToServer(updatedSession);
    
    console.log('✅ Anonymous quiz results saved successfully');
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