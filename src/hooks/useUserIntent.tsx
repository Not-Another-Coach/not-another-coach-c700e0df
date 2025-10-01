import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAnonymousSession } from './useAnonymousSession';

type UserIntent = 'client' | 'trainer' | null;

interface UserIntentContextType {
  userIntent: UserIntent;
  setUserIntent: (intent: UserIntent) => void;
  clearIntent: () => void;
  resetIntentAndCreateNewSession: () => void;
}

const UserIntentContext = createContext<UserIntentContextType | undefined>(undefined);

const INTENT_STORAGE_KEY = 'user-intent';

export function UserIntentProvider({ children }: { children: ReactNode }) {
  const [userIntent, setUserIntentState] = useState<UserIntent>(null);
  const { clearSession, createSession } = useAnonymousSession();

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const savedIntent = localStorage.getItem(INTENT_STORAGE_KEY) as UserIntent;
      
      if (savedIntent && ['client', 'trainer'].includes(savedIntent)) {
        setUserIntentState(savedIntent);
      }
    } catch (error) {
      console.error('Error loading user intent from localStorage:', error);
    }
  }, []);

  const setUserIntent = (intent: UserIntent) => {
    setUserIntentState(intent);
    
    try {
      if (intent) {
        localStorage.setItem(INTENT_STORAGE_KEY, intent);
      } else {
        localStorage.removeItem(INTENT_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving user intent to localStorage:', error);
    }
  };

  const clearIntent = () => {
    console.log('🔄 INTENT: Clearing user intent only');
    setUserIntentState(null);
    
    try {
      localStorage.removeItem(INTENT_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing user intent from localStorage:', error);
    }
  };

  const resetIntentAndCreateNewSession = () => {
    console.log('🔄 INTENT: Resetting intent and creating new anonymous session');
    
    // Clear the current anonymous session (saved trainers, quiz results, etc.)
    clearSession();
    
    // Clear user intent
    setUserIntentState(null);
    
    try {
      localStorage.removeItem(INTENT_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing user intent from localStorage:', error);
    }
    
    // Create a fresh anonymous session
    createSession();
    
    console.log('✅ INTENT: Fresh start - new session created and intent reset');
  };

  return (
    <UserIntentContext.Provider 
      value={{
        userIntent,
        setUserIntent,
        clearIntent,
        resetIntentAndCreateNewSession,
      }}
    >
      {children}
    </UserIntentContext.Provider>
  );
}

export function useUserIntent() {
  const context = useContext(UserIntentContext);
  if (context === undefined) {
    throw new Error('useUserIntent must be used within a UserIntentProvider');
  }
  return context;
}