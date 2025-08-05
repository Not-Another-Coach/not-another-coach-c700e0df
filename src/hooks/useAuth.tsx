import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up session management with single session enforcement
    const setupSessionManagement = () => {
      const currentSessionId = `session_${Date.now()}_${Math.random()}`;
      
      // Store this tab's session ID
      sessionStorage.setItem('currentSessionId', currentSessionId);
      
      // Listen for session changes from other tabs
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'activeSessionId' && e.newValue !== currentSessionId) {
          // Another tab has become active, log out this tab
          console.log('Another session detected, logging out this tab');
          supabase.auth.signOut({ scope: 'local' }); // Only log out locally, not globally
          setSession(null);
          setUser(null);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        sessionStorage.removeItem('currentSessionId');
      };
    };

    const cleanup = setupSessionManagement();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (session) {
          // When a new session is established, mark this tab as the active one
          const currentSessionId = sessionStorage.getItem('currentSessionId');
          if (currentSessionId) {
            localStorage.setItem('activeSessionId', currentSessionId);
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Mark this tab as active if it has a session
        const currentSessionId = sessionStorage.getItem('currentSessionId');
        if (currentSessionId) {
          localStorage.setItem('activeSessionId', currentSessionId);
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      cleanup();
    };
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      // When signing in successfully, mark this tab as the active session
      const currentSessionId = sessionStorage.getItem('currentSessionId');
      if (currentSessionId) {
        localStorage.setItem('activeSessionId', currentSessionId);
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}