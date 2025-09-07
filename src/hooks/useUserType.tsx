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
      console.log('useUserType: No user, setting to null');
      setUserType(null);
      setLoading(false);
      return;
    }

    console.log('useUserType: Fetching user type for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('useUserType: Error fetching user type:', error);
        setUserType(null);
      } else {
        console.log('useUserType: Successfully fetched user type:', data.user_type);
        setUserType(data.user_type as 'client' | 'trainer' | 'admin');
      }
    } catch (error) {
      console.error('useUserType: Exception fetching user type:', error);
      setUserType(null);
    } finally {
      console.log('useUserType: Setting loading to false');
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