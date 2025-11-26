import { useUserProfileContext } from '@/contexts/UserProfileContext';
import { useUserType } from '@/hooks/useUserType';
import { useAuth } from '@/hooks/useAuth';

export interface BaseSharedProfile {
  id: string;
  user_type: 'client' | 'trainer' | 'admin';
  first_name: string | null;
  last_name: string | null;
  profile_photo_url: string | null;
}

/**
 * Simplified hook that returns the unified profile with type information
 * Now uses the unified UserProfileContext which handles all user types
 */
export function useProfileByType() {
  const { user } = useAuth();
  const { user_type, loading: userTypeLoading } = useUserType();
  const { profile, loading, updateProfile } = useUserProfileContext();

  // Return unified profile with user type information
  return {
    profile: profile ? {
      ...profile,
      user_type: user_type || profile.user_type,
    } as BaseSharedProfile & typeof profile : null,
    loading: userTypeLoading || loading,
    updateProfile,
    userType: user_type
  };
}