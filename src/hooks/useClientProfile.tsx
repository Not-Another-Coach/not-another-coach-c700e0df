import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ClientProfile {
  id: string;
  user_type: 'client';
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  location: string | null;
  tagline: string | null;
  is_uk_based: boolean | null;
  profile_published: boolean | null;
  
  // Client-specific fields
  primary_goals: string[] | null;
  secondary_goals: string[] | null;
  fitness_goals: string[] | null;
  experience_level: string | null;
  preferred_training_frequency: string | null;
  preferred_time_slots: string[] | null;
  start_timeline: string | null;
  preferred_coaching_style: string[] | null;
  motivation_factors: string[] | null;
  client_personality_type: string[] | null;
  training_location_preference: string | null;
  open_to_virtual_coaching: boolean | null;
  budget_range_min: number | null;
  budget_range_max: number | null;
  budget_flexibility: string | null;
  waitlist_preference: boolean | null;
  flexible_scheduling: boolean | null;
  preferred_package_type: string | null;
  quiz_completed: boolean | null;
  quiz_answers: any;
  quiz_completed_at: string | null;
  client_survey_completed: boolean | null;
  client_survey_completed_at: string | null;
  client_status: string | null;
  client_journey_stage: string | null;
  journey_progress: any;
}

export function useClientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('v_clients')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching client profile:', error);
      } else {
        setProfile(data as ClientProfile);
      }
    } catch (error) {
      console.error('Error fetching client profile:', error);
    } finally {
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
  }, [user, fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<ClientProfile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Split updates between profiles and client_profiles tables
      const profileUpdates: any = {};
      const clientUpdates: any = {};

      // Shared profile fields
      const sharedFields = ['first_name', 'last_name', 'bio', 'profile_photo_url', 'location', 'tagline', 'is_uk_based', 'profile_published'];
      
      // Client-specific fields
      const clientFields = [
        'primary_goals', 'secondary_goals', 'fitness_goals', 'experience_level', 'preferred_training_frequency',
        'preferred_time_slots', 'start_timeline', 'preferred_coaching_style', 'motivation_factors',
        'client_personality_type', 'training_location_preference', 'open_to_virtual_coaching',
        'budget_range_min', 'budget_range_max', 'budget_flexibility', 'waitlist_preference',
        'flexible_scheduling', 'preferred_package_type', 'quiz_completed', 'quiz_answers',
        'quiz_completed_at', 'client_survey_completed', 'client_survey_completed_at',
        'client_status', 'client_journey_stage', 'journey_progress'
      ];

      Object.keys(updates).forEach(key => {
        if (sharedFields.includes(key)) {
          profileUpdates[key] = updates[key as keyof ClientProfile];
        } else if (clientFields.includes(key)) {
          clientUpdates[key] = updates[key as keyof ClientProfile];
        }
      });

      // Update profiles table if needed
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);

        if (profileError) {
          return { error: profileError };
        }
      }

      // Update client_profiles table if needed
      if (Object.keys(clientUpdates).length > 0) {
        const { error: clientError } = await supabase
          .from('client_profiles')
          .update(clientUpdates)
          .eq('id', user.id);

        if (clientError) {
          return { error: clientError };
        }
      }

      // Refetch the updated profile
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