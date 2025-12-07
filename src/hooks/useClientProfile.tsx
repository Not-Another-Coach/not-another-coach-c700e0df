/**
 * @deprecated This hook is now part of the unified useUserProfile hook
 * The ClientProfileContext now uses the unified UserProfileProvider
 * This file is kept for backwards compatibility but may be removed in the future
 * Please use useUserProfileContext or useProfileByType instead
 */

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
  gender: string | null;
  timezone: string | null;
  phone_number: string | null;
  
  // Client preferences
  trainer_gender_preference: string | null;
  discovery_call_preference: string | null;
  
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
  }, [user]); // Remove fetchProfile from dependencies to prevent loops

  const updateProfile = useCallback(async (updates: Partial<ClientProfile>, dirtyFields?: Set<string>) => {
    if (!user) {
      console.error('❌ No authenticated user for profile update');
      return { error: 'No user logged in' };
    }

    // If dirtyFields provided, filter to only changed fields
    const filteredUpdates = dirtyFields && dirtyFields.size > 0
      ? Object.fromEntries(
          Object.entries(updates).filter(([key]) => dirtyFields.has(key))
        )
      : updates;

    // Skip if no actual changes
    if (Object.keys(filteredUpdates).length === 0) {
      console.log('⏭️ No changes to save, skipping API call');
      return { data: true };
    }

    console.log('📤 Starting profile update with:', Object.keys(filteredUpdates).length, 'fields');

    try {
      // Split updates between profiles and client_profiles tables
      const profileData: Record<string, any> = {};
      const clientData: Record<string, any> = {};

      // Shared profile fields
      const sharedFields = ['first_name', 'last_name', 'bio', 'profile_photo_url', 'location', 'tagline', 'is_uk_based', 'profile_published', 'gender', 'timezone', 'phone_number'];
      
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
        'has_specific_event', 'specific_event_details', 'specific_event_date',
        // Client preferences
        'trainer_gender_preference', 'discovery_call_preference'
      ];

      Object.keys(filteredUpdates).forEach(key => {
        const value = filteredUpdates[key as keyof typeof filteredUpdates];
        if (sharedFields.includes(key)) {
          profileData[key] = value;
        } else if (clientFields.includes(key)) {
          clientData[key] = value;
        }
      });

      const hasProfileData = Object.keys(profileData).length > 0;
      const hasClientData = Object.keys(clientData).length > 0;

      console.log('🔄 Using combined RPC call:', { 
        profileFields: Object.keys(profileData).length, 
        clientFields: Object.keys(clientData).length 
      });

      // Single RPC call to update both tables atomically
      const { error } = await supabase.rpc('update_client_profile_combined', {
        p_profile_data: hasProfileData ? profileData : {},
        p_client_data: hasClientData ? clientData : {}
      });

      if (error) {
        console.error('❌ Error in combined update:', error);
        return { error };
      }

      // Optimistic update - update local state directly without refetch
      setProfile(prev => prev ? { ...prev, ...filteredUpdates } as ClientProfile : null);
      
      console.log('✅ Profile update complete (optimistic)');
      return { data: true };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return { error };
    }
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetchProfile: fetchProfile,
  };
}
