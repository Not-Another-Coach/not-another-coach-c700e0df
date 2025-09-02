import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';

export interface UserTypeInfo {
  user_type: 'client' | 'trainer' | 'admin' | null;
  loading: boolean;
}

/**
 * Lightweight hook to get user type without loading full profile data
 */
export function useUserType(): UserTypeInfo {
  const { user } = useAuth();
  const [userType, setUserType] = useState<'client' | 'trainer' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserType = useCallback(async () => {
    if (!user) {
      setUserType(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user type:', error);
        setUserType(null);
      } else {
        setUserType(data.user_type as 'client' | 'trainer' | 'admin');
      }
    } catch (error) {
      console.error('Error fetching user type:', error);
      setUserType(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserType();
  }, [fetchUserType]);

  return {
    user_type: userType,
    loading
  };
}

/**
 * Utility functions for type checking
 */
export function useUserTypeChecks() {
  const { user_type } = useUserType();

  return {
    isTrainer: () => user_type === 'trainer',
    isClient: () => user_type === 'client',
    isAdmin: () => user_type === 'admin',
    user_type
  };
}