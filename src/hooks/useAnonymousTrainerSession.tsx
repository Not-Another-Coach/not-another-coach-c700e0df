import { useState, useEffect, useCallback } from 'react';

interface AnonymousTrainerSession {
  sessionId: string;
  trainerProfile: {
    name?: string;
    tagline?: string;
    specialization?: string;
    hourlyRate?: number;
    location?: string;
    bio?: string;
  };
  demoInteractions: {
    viewedDashboard: boolean;
    usedCalculator: boolean;
    createdPreview: boolean;
    attemptedPublish: boolean;
  };
  createdAt: string;
  expiresAt: string;
}

const ANONYMOUS_TRAINER_SESSION_KEY = 'nac_anonymous_trainer_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useAnonymousTrainerSession() {
  const [session, setSession] = useState<AnonymousTrainerSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate new session ID
  const generateSessionId = () => {
    return 'trainer_anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  // Initialize or load existing session
  useEffect(() => {
    const savedSession = localStorage.getItem(ANONYMOUS_TRAINER_SESSION_KEY);
    
    if (savedSession) {
      try {
        const parsed: AnonymousTrainerSession = JSON.parse(savedSession);
        
        // Check if session is expired
        if (new Date(parsed.expiresAt) > new Date()) {
          setSession(parsed);
        } else {
          // Clean up expired session
          localStorage.removeItem(ANONYMOUS_TRAINER_SESSION_KEY);
        }
      } catch (error) {
        console.error('Error parsing anonymous trainer session:', error);
        localStorage.removeItem(ANONYMOUS_TRAINER_SESSION_KEY);
      }
    }
    
    setLoading(false);
  }, []);

  // Create new anonymous trainer session
  const createSession = useCallback(() => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION);
    
    const newSession: AnonymousTrainerSession = {
      sessionId: generateSessionId(),
      trainerProfile: {},
      demoInteractions: {
        viewedDashboard: false,
        usedCalculator: false,
        createdPreview: false,
        attemptedPublish: false,
      },
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    setSession(newSession);
    localStorage.setItem(ANONYMOUS_TRAINER_SESSION_KEY, JSON.stringify(newSession));
    
    return newSession;
  }, []);

  // Update trainer profile data
  const updateTrainerProfile = useCallback((profileData: Partial<AnonymousTrainerSession['trainerProfile']>) => {
    const currentSession = session || createSession();
    
    const updatedSession = {
      ...currentSession,
      trainerProfile: {
        ...currentSession.trainerProfile,
        ...profileData,
      },
    };
    
    setSession(updatedSession);
    localStorage.setItem(ANONYMOUS_TRAINER_SESSION_KEY, JSON.stringify(updatedSession));
  }, [session, createSession]);

  // Track demo interactions
  const trackInteraction = useCallback((interaction: keyof AnonymousTrainerSession['demoInteractions']) => {
    const currentSession = session || createSession();
    
    const updatedSession = {
      ...currentSession,
      demoInteractions: {
        ...currentSession.demoInteractions,
        [interaction]: true,
      },
    };
    
    setSession(updatedSession);
    localStorage.setItem(ANONYMOUS_TRAINER_SESSION_KEY, JSON.stringify(updatedSession));
  }, [session, createSession]);

  // Clear session (on account creation)
  const clearSession = useCallback(() => {
    setSession(null);
    localStorage.removeItem(ANONYMOUS_TRAINER_SESSION_KEY);
  }, []);

  // Get session data for account migration
  const getSessionData = useCallback(() => {
    return session;
  }, [session]);

  // Check if profile has basic info
  const hasBasicProfile = useCallback(() => {
    return session?.trainerProfile.name && session?.trainerProfile.tagline && session?.trainerProfile.specialization;
  }, [session]);

  return {
    session,
    loading,
    createSession,
    updateTrainerProfile,
    trackInteraction,
    clearSession,
    getSessionData,
    hasBasicProfile,
    trainerProfile: session?.trainerProfile || {},
    demoInteractions: session?.demoInteractions || {
      viewedDashboard: false,
      usedCalculator: false,
      createdPreview: false,
      attemptedPublish: false,
    },
  };
}