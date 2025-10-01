import { useState, useEffect, useCallback } from 'react';

interface AnonymousTrainerSession {
  sessionId: string;
  trainerProfile: {
    firstName?: string;
    lastName?: string;
    tagline?: string;
    specializations?: string[];
    hourlyRate?: number;
    location?: string;
    bio?: string;
    trainingTypes?: string[];
    qualifications?: string[];
    deliveryFormat?: string;
    idealClientTypes?: string[];
    coachingStyle?: string[];
    philosophy?: string;
    howStarted?: string;
  };
  demoInteractions: {
    viewedDashboard: boolean;
    usedCalculator: boolean;
    createdPreview: boolean;
    attemptedPublish: boolean;
  };
  progressTracking: {
    basicInfoComplete: boolean;
    specializationsComplete: boolean;
    ratesComplete: boolean;
    previewGenerated: boolean;
    lastUpdated: string;
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
      progressTracking: {
        basicInfoComplete: false,
        specializationsComplete: false,
        ratesComplete: false,
        previewGenerated: false,
        lastUpdated: now.toISOString(),
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
    
    // Calculate progress
    const updatedProfile = {
      ...currentSession.trainerProfile,
      ...profileData,
    };
    
    const basicInfoComplete = !!(updatedProfile.firstName && updatedProfile.lastName && updatedProfile.tagline);
    const specializationsComplete = !!(updatedProfile.specializations && updatedProfile.specializations.length > 0);
    const ratesComplete = !!(updatedProfile.hourlyRate && updatedProfile.hourlyRate > 0);
    
    const updatedSession = {
      ...currentSession,
      trainerProfile: updatedProfile,
      progressTracking: {
        ...currentSession.progressTracking,
        basicInfoComplete,
        specializationsComplete,
        ratesComplete,
        lastUpdated: new Date().toISOString(),
      },
    };
    
    setSession(updatedSession);
    localStorage.setItem(ANONYMOUS_TRAINER_SESSION_KEY, JSON.stringify(updatedSession));
  }, [session, createSession]);

  // Track demo interactions
  const trackInteraction = useCallback((interaction: keyof AnonymousTrainerSession['demoInteractions']) => {
    const currentSession = session || createSession();
    
    // Update progress when preview is created
    const progressUpdate = interaction === 'createdPreview' 
      ? { previewGenerated: true }
      : {};
    
    const updatedSession = {
      ...currentSession,
      demoInteractions: {
        ...currentSession.demoInteractions,
        [interaction]: true,
      },
      progressTracking: {
        ...currentSession.progressTracking,
        ...progressUpdate,
        lastUpdated: new Date().toISOString(),
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
    return session?.trainerProfile.firstName && 
           session?.trainerProfile.lastName && 
           session?.trainerProfile.tagline && 
           session?.trainerProfile.specializations && 
           session?.trainerProfile.specializations.length > 0;
  }, [session]);
  
  // Calculate overall progress percentage
  const getProgressPercentage = useCallback(() => {
    if (!session) return 0;
    
    const progress = session.progressTracking;
    const weights = {
      basicInfoComplete: 40,
      specializationsComplete: 30,
      ratesComplete: 20,
      previewGenerated: 10,
    };
    
    let totalProgress = 0;
    if (progress.basicInfoComplete) totalProgress += weights.basicInfoComplete;
    if (progress.specializationsComplete) totalProgress += weights.specializationsComplete;
    if (progress.ratesComplete) totalProgress += weights.ratesComplete;
    if (progress.previewGenerated) totalProgress += weights.previewGenerated;
    
    return totalProgress;
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
    getProgressPercentage,
    trainerProfile: session?.trainerProfile || {},
    demoInteractions: session?.demoInteractions || {
      viewedDashboard: false,
      usedCalculator: false,
      createdPreview: false,
      attemptedPublish: false,
    },
    progressTracking: session?.progressTracking || {
      basicInfoComplete: false,
      specializationsComplete: false,
      ratesComplete: false,
      previewGenerated: false,
      lastUpdated: new Date().toISOString(),
    },
  };
}