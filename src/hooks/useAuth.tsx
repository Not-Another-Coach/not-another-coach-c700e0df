import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthService } from '@/services';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener using AuthService
    const unsubscribe = AuthService.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check for existing session using AuthService
    AuthService.getSession().then((response) => {
      if (response.success) {
        setSession(response.data);
        setUser(response.data?.user ?? null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const response = await AuthService.signUp(
      {
        email,
        password,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        userType: userData?.userType || 'client',
      },
      redirectUrl
    );
    
    return { error: response.error || null };
  };

  const signIn = async (email: string, password: string) => {
    const response = await AuthService.signIn({
      email,
      password,
    });
    return { error: response.error || null };
  };

  const signOut = async () => {
    // Clear any saved credentials
    localStorage.removeItem('savedCredentials');
    localStorage.removeItem('rememberMe');
    
    // Redirect IMMEDIATELY - before any state changes cause re-renders
    window.location.href = '/auth';
    
    // Sign out from Supabase (executes but user is already navigating away)
    await AuthService.signOut();
    
    return { error: null };
  };

  const resendConfirmation = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const response = await AuthService.resendConfirmation(email, redirectUrl);
    return { error: response.error || null };
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
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