import { useUserProfileContext } from '@/contexts/UserProfileContext';

export interface BaseSharedProfile {
  id: string;
  user_type: 'client' | 'trainer' | 'admin';
  first_name: string | null;
  last_name: string | null;
  profile_photo_url: string | null;
}

/**
 * Simplified hook that returns the unified profile with type information
 * Reads from the unified UserProfileContext - no redundant calls
 */
export function useProfileByType() {
  const { profile, loading, updateProfile } = useUserProfileContext();

  // Return unified profile with user type information
  return {
    profile,
    loading,
    updateProfile,
    userType: profile?.user_type ?? null
  };
}