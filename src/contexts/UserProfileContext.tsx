import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

interface UserProfileContextType {
  profile: any;
  loading: boolean;
  updateProfile: (updates: any, options?: { suppressToast?: boolean }) => Promise<any>;
  refetchProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

/**
 * Unified profile provider that handles all user types (trainer, client, admin)
 * Eliminates race conditions by coordinating user type detection and profile fetching
 */
export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const { profile, loading, updateProfile, refetchProfile } = useUserProfile();

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      profile,
      loading,
      updateProfile,
      refetchProfile,
    }),
    [profile, loading, updateProfile, refetchProfile]
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfileContext = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  }
  return context;
};

/**
 * Backwards compatibility exports
 * These allow existing components to continue using the old hook names
 * while transparently using the new unified provider
 */
export const useTrainerProfileContext = useUserProfileContext;
export const useClientProfileContext = useUserProfileContext;
