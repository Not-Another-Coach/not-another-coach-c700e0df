import { useTrainerProfileContext } from '@/contexts/TrainerProfileContext';
import { useClientProfileContext } from '@/contexts/ClientProfileContext';
import { useUserType } from '@/hooks/useUserType';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';

export interface BaseSharedProfile {
  id: string;
  user_type: 'client' | 'trainer' | 'admin';
  first_name: string | null;
  last_name: string | null;
  profile_photo_url: string | null;
}

// Hook for admin users to get basic profile info
function useAdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BaseSharedProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    console.log('useAdminProfile: Fetching admin profile for user:', user.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_type, first_name, last_name, profile_photo_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('useAdminProfile: Error fetching admin profile:', error);
      } else {
        console.log('useAdminProfile: Successfully fetched admin profile:', data);
        setProfile(data as BaseSharedProfile);
      }
    } catch (error) {
      console.error('useAdminProfile: Exception fetching admin profile:', error);
    } finally {
      console.log('useAdminProfile: Setting loading to false');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]); // Remove fetchProfile from dependencies to prevent loops

  const updateProfile = useCallback(async (updates: Partial<BaseSharedProfile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      await fetchProfile();
      return { data: true };
    } catch (error) {
      return { error };
    }
  }, [user, fetchProfile]);

  return {
    profile,
    loading,
    updateProfile,
    refetchProfile: fetchProfile,
  };
}

/**
 * Conditional hook that returns the appropriate domain-specific profile
 * Use this for components that need basic profile info regardless of user type
 */
export function useProfileByType() {
  const { user } = useAuth();
  const { user_type, loading: userTypeLoading } = useUserType();
  const { profile: trainerProfile, loading: trainerLoading, updateProfile: updateTrainerProfile } = useTrainerProfileContext();
  const { profile: clientProfile, loading: clientLoading, updateProfile: updateClientProfile } = useClientProfileContext();
  const { profile: adminProfile, loading: adminLoading, updateProfile: updateAdminProfile } = useAdminProfile();

  // Return appropriate profile based on user type
  if (user_type === 'trainer') {
    return {
      profile: trainerProfile ? {
        id: trainerProfile.id,
        user_type: 'trainer' as const, // Always trainer for this hook
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

  if (user_type === 'admin') {
    return {
      profile: adminProfile,
      loading: adminLoading,
      updateProfile: updateAdminProfile,
      userType: 'admin' as const
    };
  }

  // If we're still loading auth or user type (and have a user), keep loading
  if (user && userTypeLoading) {
    return {
      profile: null,
      loading: true,
      updateProfile: async () => ({ error: 'Loading...' }),
      userType: null
    };
  }

  // Default case - no authenticated user or user type not determined
  return {
    profile: null,
    loading: false, // ✅ No user means no need to keep loading
    updateProfile: async () => ({ error: 'No user type determined' }),
    userType: null
  };
}