import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrainerProfile {
  id: string;
  user_type: 'trainer';
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  location: string | null;
  tagline: string | null;
  is_uk_based: boolean | null;
  profile_published: boolean | null;
  
  // Trainer-specific fields
  specializations: string[] | null;
  qualifications: string[] | null;
  certifying_body: string | null;
  year_certified: number | null;
  uploaded_certificates: any;
  hourly_rate: number | null;
  package_options: any;
  availability_schedule: any;
  max_clients: number | null;
  works_bank_holidays: boolean | null;
  verification_status: string | null;
  verification_requested_at: string | null;
  verification_documents: any;
  admin_verification_notes: string | null;
  admin_review_notes: string | null;
  is_verified: boolean | null;
  rating: number | null;
  total_ratings: number | null;
  free_discovery_call: boolean | null;
  offers_discovery_call: boolean | null;
  discovery_call_price: number | null;
  calendar_link: string | null;
  testimonials: any;
  training_types: string[] | null;
  delivery_format: string[] | null;
  communication_style: string[] | null;
  video_checkins: boolean | null;
  messaging_support: boolean | null;
  weekly_programming_only: boolean | null;
  ways_of_working_onboarding: string[] | null;
  ways_of_working_first_week: string[] | null;
  ways_of_working_ongoing: string[] | null;
  ways_of_working_tracking: string[] | null;
  ways_of_working_expectations: string[] | null;
  ways_of_working_what_i_bring: string[] | null;
  profile_setup_completed: boolean | null;
  terms_agreed: boolean | null;
  how_started: string | null;
  philosophy: string | null;
  professional_milestones: any[] | null;
  profile_image_position: any | null;
}

export function useTrainerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('v_trainers')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching trainer profile:', error);
      } else {
        // Ensure new fields exist with default values if not present in the view
        const profileWithDefaults = {
          ...data,
          how_started: (data as any)?.how_started || null,
          philosophy: (data as any)?.philosophy || null,
          professional_milestones: (data as any)?.professional_milestones || null,
          profile_image_position: (data as any)?.profile_image_position || null
        } as TrainerProfile;
        setProfile(profileWithDefaults);
      }
    } catch (error) {
      console.error('Error fetching trainer profile:', error);
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

  const updateProfile = useCallback(async (updates: Partial<TrainerProfile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Split updates between profiles and trainer_profiles tables
      const profileUpdates: any = {};
      const trainerUpdates: any = {};

      // Shared profile fields
      const sharedFields = ['first_name', 'last_name', 'bio', 'profile_photo_url', 'location', 'tagline', 'is_uk_based', 'profile_published', 'professional_milestones', 'profile_image_position'];
      
      // Trainer-specific fields  
      const trainerFields = [
        'specializations', 'qualifications', 'certifying_body', 'year_certified', 'uploaded_certificates',
        'hourly_rate', 'package_options', 'availability_schedule', 'max_clients', 'works_bank_holidays',
        'verification_status', 'verification_requested_at', 'verification_documents', 'admin_verification_notes',
        'admin_review_notes', 'is_verified', 'rating', 'total_ratings', 'free_discovery_call', 
        'offers_discovery_call', 'discovery_call_price', 'calendar_link', 'testimonials', 'training_types',
        'delivery_format', 'communication_style', 'video_checkins', 'messaging_support', 
        'weekly_programming_only', 'ways_of_working_onboarding', 'ways_of_working_first_week',
        'ways_of_working_ongoing', 'ways_of_working_tracking', 'ways_of_working_expectations',
        'ways_of_working_what_i_bring', 'profile_setup_completed', 'terms_agreed', 'how_started', 'philosophy'
      ];

      Object.keys(updates).forEach(key => {
        if (sharedFields.includes(key)) {
          profileUpdates[key] = updates[key as keyof TrainerProfile];
        } else if (trainerFields.includes(key)) {
          trainerUpdates[key] = updates[key as keyof TrainerProfile];
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

      // Update trainer_profiles table if needed
      if (Object.keys(trainerUpdates).length > 0) {
        const { error: trainerError } = await supabase
          .from('trainer_profiles')
          .update(trainerUpdates)
          .eq('id', user.id);

        if (trainerError) {
          return { error: trainerError };
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