import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAnonymousSession } from './useAnonymousSession';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  loading: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { session: anonymousSession } = useAnonymousSession();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    let redirectUrl = `${window.location.origin}/auth/callback`;
    
    // Include anonymous session ID in redirect URL for cross-device data migration
    if (anonymousSession?.sessionId) {
      const params = new URLSearchParams({ session_id: anonymousSession.sessionId });
      redirectUrl += `?${params.toString()}`;
      console.log('🔗 Including anonymous session in redirect URL for cross-device migration');
    }
    
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
    return { error };
  };

  const signOut = async () => {
    // Set logging out flag to prevent redirect conflicts
    setIsLoggingOut(true);
    
    // Clear any saved credentials
    localStorage.removeItem('savedCredentials');
    localStorage.removeItem('rememberMe');
    
    // Clear the user and session state immediately
    setUser(null);
    setSession(null);
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      // Even if there's an error (like session missing), still redirect
      // because the user wants to be logged out
    }
    
    // Use window.location for immediate, clean redirect
    window.location.href = '/auth';
    
    return { error };
  };

  const resendConfirmation = async (email: string) => {
    let redirectUrl = `${window.location.origin}/auth/callback`;
    
    // Include anonymous session ID in redirect URL for cross-device data migration
    if (anonymousSession?.sessionId) {
      const params = new URLSearchParams({ session_id: anonymousSession.sessionId });
      redirectUrl += `?${params.toString()}`;
      console.log('🔗 Including anonymous session in resend confirmation URL');
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
    loading,
    isLoggingOut,
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