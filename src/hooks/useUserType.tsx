import { useUserProfileContext } from '@/contexts/UserProfileContext';

export interface UserTypeInfo {
  user_type: 'client' | 'trainer' | 'admin' | null;
  loading: boolean;
}

/**
 * Lightweight hook to get user type from the cached user profile
 * No additional API calls - reads from shared context
 */
export function useUserType(): UserTypeInfo {
  const { profile, loading } = useUserProfileContext();
  
  return {
    user_type: profile?.user_type ?? null,
    loading,
  };
}

/**
 * Utility functions for type checking
 */
export function useUserTypeChecks() {
  const { user_type, loading } = useUserType();

  return {
    isTrainer: () => user_type === 'trainer',
    isClient: () => user_type === 'client',
    isAdmin: () => user_type === 'admin',
    user_type,
    loading,
  };
}
