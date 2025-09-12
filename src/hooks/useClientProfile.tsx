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
  
  // Lifestyle and health fields
  fitness_equipment_access: string[] | null;
  lifestyle_description: string[] | null;
  lifestyle_other: string | null;
  health_conditions: string | null;
  has_specific_event: string | null;
  specific_event_details: string | null;
  specific_event_date: string | Date | null;
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
    if (!user) {
      console.error('❌ No authenticated user for profile update');
      return { error: 'No user logged in' };
    }

    console.log('📤 Starting profile update with:', updates);

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
        'client_status', 'client_journey_stage', 'journey_progress',
        // Lifestyle and health fields
        'fitness_equipment_access', 'lifestyle_description', 'lifestyle_other', 'health_conditions',
        'has_specific_event', 'specific_event_details', 'specific_event_date'
      ];

      Object.keys(updates).forEach(key => {
        if (sharedFields.includes(key)) {
          profileUpdates[key] = updates[key as keyof ClientProfile];
        } else if (clientFields.includes(key)) {
          clientUpdates[key] = updates[key as keyof ClientProfile];
        }
      });

      console.log('🔄 Split updates:', { profileUpdates, clientUpdates });

      // Update profiles table if needed
      if (Object.keys(profileUpdates).length > 0) {
        console.log('📝 Updating profiles table...');
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);

        if (profileError) {
          console.error('❌ Error updating profiles table:', profileError);
          return { error: profileError };
        }
        console.log('✅ Profiles table updated successfully');
      }

      // Upsert client_profiles table if needed
      if (Object.keys(clientUpdates).length > 0) {
        console.log('📝 Upserting client_profiles table...');
        const { error: clientError } = await supabase
          .from('client_profiles')
          .upsert({ id: user.id, ...clientUpdates })
          .eq('id', user.id);

        if (clientError) {
          console.error('❌ Error updating client_profiles table:', clientError);
          return { error: clientError };
        }
        console.log('✅ Client_profiles table updated successfully');
      }

      // Refetch the updated profile
      console.log('🔄 Refetching profile after update...');
      await fetchProfile();
      console.log('✅ Profile update complete');
      return { data: true };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
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