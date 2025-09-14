import { useState, useEffect, useCallback } from 'react';

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

  // Initialize or load existing session
  useEffect(() => {
    const savedSession = localStorage.getItem(ANONYMOUS_SESSION_KEY);
    
    if (savedSession) {
      try {
        const parsed: AnonymousSession = JSON.parse(savedSession);
        
        // Check if session is expired
        if (new Date(parsed.expiresAt) > new Date()) {
          setSession(parsed);
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
  }, []);

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
    
    return newSession;
  }, []);

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
    return true;
  }, [session, createSession]);

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
  }, [session]);

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
    console.log('✅ Anonymous quiz results saved successfully');
  }, [session, createSession]);

  // Clear session (on account creation)
  const clearSession = useCallback(() => {
    setSession(null);
    localStorage.removeItem(ANONYMOUS_SESSION_KEY);
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
  }, []);

  // Get session data for account migration
  const getSessionData = useCallback(() => {
    return session;
  }, [session]);

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
    isTrainerSaved: (trainerId: string) => session?.savedTrainers.includes(trainerId) ?? false,
    savedTrainersCount: session?.savedTrainers.length ?? 0,
  };
}