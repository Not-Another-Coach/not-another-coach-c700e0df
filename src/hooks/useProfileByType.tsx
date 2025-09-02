import { useTrainerProfile } from '@/hooks/useTrainerProfile';
import { useClientProfile } from '@/hooks/useClientProfile';
import { useUserType } from '@/hooks/useUserType';

export interface BaseSharedProfile {
  id: string;
  user_type: 'client' | 'trainer' | 'admin';
  first_name: string | null;
  last_name: string | null;
  profile_photo_url: string | null;
}

/**
 * Conditional hook that returns the appropriate domain-specific profile
 * Use this for components that need basic profile info regardless of user type
 */
export function useProfileByType() {
  const { user_type } = useUserType();
  const { profile: trainerProfile, loading: trainerLoading, updateProfile: updateTrainerProfile } = useTrainerProfile();
  const { profile: clientProfile, loading: clientLoading, updateProfile: updateClientProfile } = useClientProfile();

  // Return appropriate profile based on user type
  if (user_type === 'trainer') {
    return {
      profile: trainerProfile ? {
        id: trainerProfile.id,
        user_type: trainerProfile.user_type,
        first_name: trainerProfile.first_name,
        last_name: trainerProfile.last_name,
        profile_photo_url: trainerProfile.profile_photo_url,
        // Include full trainer profile for type-specific components
        ...trainerProfile
      } as BaseSharedProfile & typeof trainerProfile : null,
      loading: trainerLoading,
      updateProfile: updateTrainerProfile,
      userType: 'trainer' as const
    };
  }

  if (user_type === 'client') {
    return {
      profile: clientProfile ? {
        id: clientProfile.id,
        user_type: clientProfile.user_type,
        first_name: clientProfile.first_name,
        last_name: clientProfile.last_name,
        profile_photo_url: clientProfile.profile_photo_url,
        // Include full client profile for type-specific components
        ...clientProfile
      } as BaseSharedProfile & typeof clientProfile : null,
      loading: clientLoading,
      updateProfile: updateClientProfile,
      userType: 'client' as const
    };
  }

  // Default case (no user type determined yet)
  return {
    profile: null,
    loading: true,
    updateProfile: async () => ({ error: 'No user type determined' }),
    userType: null
  };
}