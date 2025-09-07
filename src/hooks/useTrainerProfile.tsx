import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Add interfaces for activity-centric types
interface SelectedActivity {
  id?: string;
  name: string;
  category: string;
  isCustom: boolean;
}

interface ActivityPackageAssignment {
  activityName: string;
  assignedTo: 'all' | 'specific';
  packageIds: string[];
}

interface TrainerProfile {
  id: string;
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
  coaching_style: string[] | null;
  client_preferences: string[] | null;
  ideal_client_personality: string | null;
  ideal_client_types: string[] | null;
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
  accuracy_confirmed: boolean | null;
  notify_profile_views: boolean | null;
  notify_messages: boolean | null;
  notify_insights: boolean | null;
  how_started: string | null;
  philosophy: string | null;
  professional_milestones: any[] | null;
  profile_image_position: any | null;
  
  // New activity-centric Ways of Working fields
  wow_how_i_work: string | null;
  wow_what_i_provide: string | null;
  wow_client_expectations: string | null;
  wow_activities: {
    wow_how_i_work: SelectedActivity[];
    wow_what_i_provide: SelectedActivity[];
    wow_client_expectations: SelectedActivity[];
  } | null;
  wow_activity_assignments: ActivityPackageAssignment[] | null;
  wow_visibility: string | null;
  wow_setup_completed: boolean | null;
}

export function useTrainerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for user:', user.email, user.id);
      const { data, error } = await supabase
        .from('v_trainers')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching trainer profile:', error);
      } else {
        console.log('Fetched trainer profile data:', data);
        // Ensure new fields exist with default values if not present in the view
        const profileWithDefaults = {
          ...data,
          how_started: (data as any)?.how_started || null,
          philosophy: (data as any)?.philosophy || null,
          professional_milestones: (data as any)?.professional_milestones || null,
          profile_image_position: (data as any)?.profile_image_position || null,
          coaching_style: (data as any)?.coaching_style || null,
          client_preferences: (data as any)?.client_preferences || null,
          ideal_client_personality: (data as any)?.ideal_client_personality || null,
          ideal_client_types: (data as any)?.ideal_client_types || null,
          // New activity-centric Ways of Working fields
          wow_how_i_work: (data as any)?.wow_how_i_work || null,
          wow_what_i_provide: (data as any)?.wow_what_i_provide || null,
          wow_client_expectations: (data as any)?.wow_client_expectations || null,
          wow_activities: (data as any)?.wow_activities || null,
          wow_activity_assignments: (data as any)?.wow_activity_assignments || null,
          wow_visibility: (data as any)?.wow_visibility || null,
          wow_setup_completed: (data as any)?.wow_setup_completed || null,
          accuracy_confirmed: (data as any)?.accuracy_confirmed || null,
          notify_profile_views: (data as any)?.notify_profile_views || null,
          notify_messages: (data as any)?.notify_messages || null,
          notify_insights: (data as any)?.notify_insights || null,
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

      // Shared profile fields (general profile info, profile_image_position, and new WoW fields)
      const sharedFields = ['first_name', 'last_name', 'bio', 'profile_photo_url', 'location', 'tagline', 'is_uk_based', 'profile_published', 'profile_image_position', 'wow_how_i_work', 'wow_what_i_provide', 'wow_client_expectations', 'wow_activities', 'wow_activity_assignments', 'wow_visibility', 'wow_setup_completed'];
      
      // Trainer-specific fields (all trainer-related fields including the moved ones)
      const trainerFields = [
        'specializations', 'qualifications', 'certifying_body', 'year_certified', 'uploaded_certificates',
        'hourly_rate', 'package_options', 'availability_schedule', 'max_clients', 'works_bank_holidays',
        'verification_requested_at', 'verification_documents', 'admin_verification_notes',
        'is_verified', 'rating', 'total_ratings', 'free_discovery_call', 
        'offers_discovery_call', 'discovery_call_price', 'calendar_link', 'testimonials', 'training_types',
        'delivery_format', 'communication_style', 'coaching_style', 'client_preferences', 
        'ideal_client_personality', 'ideal_client_types', 'video_checkins', 'messaging_support', 
        'weekly_programming_only', 'ways_of_working_onboarding', 'ways_of_working_first_week',
        'ways_of_working_ongoing', 'ways_of_working_tracking', 'ways_of_working_expectations',
        'ways_of_working_what_i_bring', 'profile_setup_completed', 'terms_agreed', 'accuracy_confirmed', 'how_started', 'philosophy', 
        'professional_milestones', 'notify_profile_views', 'notify_messages', 'notify_insights'
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