import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTrainerProfile } from '@/hooks/useTrainerProfile';
import { useClientProfile } from '@/hooks/useClientProfile';

type UserRole = 'client' | 'trainer' | 'admin';

interface BaseProfile {
  id: string;
  user_type: UserRole;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  location: string | null;
  tagline: string | null;
  is_uk_based: boolean | null;
  profile_published: boolean | null;
}

// Legacy interface for backward compatibility
interface Profile extends BaseProfile {
  specializations?: string[] | null;
  qualifications?: string[] | null;
  is_verified?: boolean;
  rating?: number;
  total_ratings?: number;
  fitness_goals?: string[] | null;
  quiz_completed?: boolean;
  quiz_answers?: any;
  quiz_completed_at?: string | null;
  hourly_rate?: number | null;
  training_types?: string[] | null;
  terms_agreed?: boolean | null;
  profile_setup_completed?: boolean | null;
  client_status?: 'onboarding' | 'survey_completed' | 'browsing' | 'shortlisted' | 'discovery_booked' | 'decision_pending' | 'coach_selected' | null;
}

export function useProfile() {
  // DEPRECATED: This hook is deprecated. Use useTrainerProfile, useClientProfile, or useProfileByType instead.
  React.useEffect(() => {
    console.warn(
      '⚠️ DEPRECATED: useProfile hook is deprecated. Please migrate to:\n' +
      '- useTrainerProfile() for trainer-specific data\n' +
      '- useClientProfile() for client-specific data\n' +
      '- useProfileByType() for shared components\n' +
      '- useUserTypeChecks() for user type checking\n' +
      'This hook will be removed in a future version.'
    );
  }, []);

  const { user, session } = useAuth();
  const [baseProfile, setBaseProfile] = useState<BaseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use domain-specific hooks
  const trainerProfile = useTrainerProfile();
  const clientProfile = useClientProfile();

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_type, first_name, last_name, bio, profile_photo_url, location, tagline, is_uk_based, profile_published, created_at, updated_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setBaseProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setBaseProfile(null);
      setLoading(false);
    }
  }, [user, fetchProfile]);

  // Create legacy profile for backward compatibility
  const profile: Profile | null = React.useMemo(() => {
    if (!baseProfile) return null;

    const legacyProfile: Profile = { ...baseProfile };

    // Add domain-specific fields for backward compatibility
    if (baseProfile.user_type === 'trainer' && trainerProfile.profile) {
      Object.assign(legacyProfile, {
        specializations: trainerProfile.profile.specializations,
        qualifications: trainerProfile.profile.qualifications,
        is_verified: trainerProfile.profile.is_verified,
        rating: trainerProfile.profile.rating,
        total_ratings: trainerProfile.profile.total_ratings,
        hourly_rate: trainerProfile.profile.hourly_rate,
        training_types: trainerProfile.profile.training_types,
        terms_agreed: trainerProfile.profile.terms_agreed,
        profile_setup_completed: trainerProfile.profile.profile_setup_completed,
      });
    } else if (baseProfile.user_type === 'client' && clientProfile.profile) {
      Object.assign(legacyProfile, {
        fitness_goals: clientProfile.profile.fitness_goals,
        quiz_completed: clientProfile.profile.quiz_completed,
        quiz_answers: clientProfile.profile.quiz_answers,
        quiz_completed_at: clientProfile.profile.quiz_completed_at,
        client_status: clientProfile.profile.client_status as any,
      });
    }

    return legacyProfile;
  }, [baseProfile, trainerProfile.profile, clientProfile.profile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    // Route updates to the appropriate hook based on user type
    if (baseProfile?.user_type === 'trainer') {
      return trainerProfile.updateProfile(updates as any);
    } else if (baseProfile?.user_type === 'client') {
      return clientProfile.updateProfile(updates as any);
    } else {
      // Fallback for basic profile updates
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          return { error };
        }

        await fetchProfile();
        return { data };
      } catch (error) {
        return { error };
      }
    }
  }, [user, baseProfile?.user_type, trainerProfile.updateProfile, clientProfile.updateProfile, fetchProfile]);

  const isAdmin = useCallback(() => baseProfile?.user_type === 'admin', [baseProfile?.user_type]);
  const isTrainer = useCallback(() => baseProfile?.user_type === 'trainer', [baseProfile?.user_type]);
  const isClient = useCallback(() => baseProfile?.user_type === 'client', [baseProfile?.user_type]);

  // Get client status using the new consolidated function
  const getClientStatus = useCallback(async () => {
    if (!profile?.id || profile?.user_type !== 'client') return null;
    
    const { data } = await supabase.rpc('get_client_status', { 
      p_client_id: profile.id 
    });
    return data;
  }, [profile?.id, profile?.user_type]);

  const combinedLoading = loading || (baseProfile?.user_type === 'trainer' ? trainerProfile.loading : false) || (baseProfile?.user_type === 'client' ? clientProfile.loading : false);

  return {
    profile,
    loading: combinedLoading,
    updateProfile,
    refetchProfile: fetchProfile,
    isAdmin,
    isTrainer,
    isClient,
    getClientStatus,
  };
}