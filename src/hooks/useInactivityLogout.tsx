import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

interface UseInactivityLogoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

interface UseInactivityLogoutReturn {
  showWarning: boolean;
  remainingSeconds: number;
  dismissWarning: () => void;
  resetTimer: () => void;
}

export function useInactivityLogout({
  timeoutMinutes = 30,
  warningMinutes = 2,
}: UseInactivityLogoutOptions = {}): UseInactivityLogoutReturn {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(warningMinutes * 60);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const handleLogout = useCallback(async () => {
    clearAllTimers();
    setShowWarning(false);
    await signOut();
  }, [signOut, clearAllTimers]);

  const startCountdown = useCallback(() => {
    setShowWarning(true);
    setRemainingSeconds(warningMinutes * 60);
    
    countdownRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningMinutes, handleLogout]);

  const resetTimer = useCallback(() => {
    if (!user) return;
    
    clearAllTimers();
    setShowWarning(false);
    lastActivityRef.current = Date.now();
    
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    
    warningTimeoutRef.current = setTimeout(() => {
      startCountdown();
    }, warningTime);
  }, [user, timeoutMinutes, warningMinutes, clearAllTimers, startCountdown]);

  const dismissWarning = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) {
      clearAllTimers();
      return;
    }

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    let throttleTimeout: NodeJS.Timeout | null = null;
    
    const handleActivity = () => {
      // Throttle activity detection to every 30 seconds
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 30000);
      
      // Only reset if not showing warning (user must explicitly dismiss)
      if (!showWarning) {
        lastActivityRef.current = Date.now();
        resetTimer();
      }
    };

    // Start the initial timer
    resetTimer();

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearAllTimers();
      if (throttleTimeout) clearTimeout(throttleTimeout);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, showWarning, resetTimer, clearAllTimers]);

  return {
    showWarning,
    remainingSeconds,
    dismissWarning,
    resetTimer,
  };
}
