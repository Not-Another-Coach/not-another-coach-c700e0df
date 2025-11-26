import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  profile: any;
  loading: boolean;
  updateProfile: (updates: any) => Promise<any>;
  refetchProfile: () => Promise<void>;
}

/**
 * Unified hook that fetches the appropriate profile based on user type
 * Eliminates race conditions by coordinating user type check and profile fetch
 */
export function useUserProfile(): ProfileData {
  const { user } = useAuth();
  const { user_type, loading: userTypeLoading } = useUserType();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user || !user_type) {
      setProfile(null);
      setLoading(false);
      return;
    }

    console.log('useUserProfile: Fetching profile for user type:', user_type);
    setLoading(true);

    try {
      let data, error;

      switch (user_type) {
        case 'trainer': {
          const response = await supabase
            .from('v_trainers')
            .select('*')
            .eq('id', user.id)
            .single();
          data = response.data;
          error = response.error;
          break;
        }
        
        case 'client': {
          const response = await supabase
            .from('v_clients')
            .select('*')
            .eq('id', user.id)
            .single();
          data = response.data;
          error = response.error;
          break;
        }
        
        case 'admin': {
          const response = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          data = response.data;
          error = response.error;
          break;
        }
        
        default:
          console.warn('useUserProfile: Unknown user type:', user_type);
          setProfile(null);
          setLoading(false);
          return;
      }

      if (error) {
        console.error('useUserProfile: Error fetching profile:', error);
        setProfile(null);
      } else {
        console.log('useUserProfile: Successfully fetched profile for', user_type);
        setProfile(data);
      }
    } catch (error) {
      console.error('useUserProfile: Exception fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user, user_type]);

  const updateProfile = useCallback(async (updates: any) => {
    if (!user || !user_type) {
      throw new Error('No user or user type available');
    }

    console.log('useUserProfile: Updating profile for', user_type, updates);

    try {
      // Determine which fields go to which tables
      const profileFields = ['full_name', 'email', 'phone', 'profile_photo_url', 'location', 'bio'];
      const profileUpdates: any = {};
      const typeSpecificUpdates: any = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (profileFields.includes(key)) {
          profileUpdates[key] = value;
        } else {
          typeSpecificUpdates[key] = value;
        }
      });

      // Update profiles table if needed
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // Update type-specific table if needed
      if (Object.keys(typeSpecificUpdates).length > 0) {
        const tableName = user_type === 'trainer' ? 'trainer_profiles' : 
                         user_type === 'client' ? 'client_profiles' : null;
        
        if (tableName) {
          const { error: typeError } = await supabase
            .from(tableName)
            .update(typeSpecificUpdates)
            .eq('id', user.id);

          if (typeError) throw typeError;
        }
      }

      // Refetch to get updated data
      await fetchProfile();

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });

      return profile;
    } catch (error) {
      console.error('useUserProfile: Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, user_type, fetchProfile, profile, toast]);

  // Effect to fetch profile when user or user_type changes
  useEffect(() => {
    console.log('useUserProfile: Effect triggered', { 
      hasUser: !!user, 
      userType: user_type, 
      userTypeLoading 
    });

    // Wait for user type to be determined
    if (userTypeLoading) {
      console.log('useUserProfile: Waiting for user type...');
      return;
    }

    // Fetch profile once user type is known
    if (user && user_type) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user, user_type, userTypeLoading, fetchProfile]);

  return {
    profile,
    loading: userTypeLoading || loading, // Combined loading state
    updateProfile,
    refetchProfile: fetchProfile,
  };
}
