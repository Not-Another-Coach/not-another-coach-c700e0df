import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryConfig } from '@/lib/queryConfig';

interface ProfileData {
  profile: any;
  loading: boolean;
  updateProfile: (updates: any) => Promise<any>;
  refetchProfile: () => Promise<void>;
}

/**
 * Unified hook that fetches the appropriate profile based on user type
 * Uses React Query for caching and deduplication across all components
 */
export function useUserProfile(): ProfileData {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      console.log('useUserProfile: Fetching profile for user:', user.id);

      // Try trainer view first (includes user_type from join)
      const { data: trainerData, error: trainerError } = await supabase
        .from('v_trainers')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!trainerError && trainerData) {
        console.log('useUserProfile: Successfully fetched trainer profile');
        return trainerData;
      }

      // Try client view
      const { data: clientData, error: clientError } = await supabase
        .from('v_clients')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!clientError && clientData) {
        console.log('useUserProfile: Successfully fetched client profile');
        return clientData;
      }

      // Fallback to base profile for admin
      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (adminError) throw adminError;
      
      console.log('useUserProfile: Successfully fetched admin profile');
      return adminData;
    },
    enabled: !!user?.id,
    staleTime: queryConfig.user.staleTime,
    gcTime: queryConfig.user.gcTime,
    refetchOnMount: queryConfig.user.refetchOnMount,
    refetchOnWindowFocus: queryConfig.user.refetchOnWindowFocus,
    refetchOnReconnect: queryConfig.user.refetchOnReconnect,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!user || !profile?.user_type) {
        throw new Error('No user or user type available');
      }

      console.log('useUserProfile: Updating profile for', profile.user_type, updates);

      // Fields from trainer_profiles table
      const trainerProfileFields = [
        'hourly_rate', 'free_discovery_call', 'calendar_link', 'profile_setup_completed',
        'max_clients', 'qualifications', 'specializations', 'training_types', 'delivery_format',
        'ideal_client_types', 'coaching_style', 'communication_style', 'ideal_client_personality',
        'package_options', 'video_checkins', 'messaging_support', 'weekly_programming_only',
        'how_started', 'philosophy', 'professional_milestones', 'uploaded_certificates',
        'testimonials', 'verification_status', 'verification_documents', 'admin_verification_notes',
        'admin_review_notes', 'is_verified', 'verification_requested_at', 'rating', 'total_ratings',
        'certifying_body', 'year_certified', 'availability_schedule', 'works_bank_holidays',
        'document_not_applicable', 'offers_discovery_call', 'discovery_call_price',
        'client_preferences', 'training_type_delivery'
      ];

      // Fields from client_profiles table
      const clientProfileFields = [
        'primary_goals', 'secondary_goals', 'fitness_goals', 'experience_level',
        'preferred_training_frequency', 'preferred_time_slots', 'start_timeline',
        'preferred_coaching_style', 'motivation_factors', 'client_personality_type',
        'training_location_preference', 'open_to_virtual_coaching', 'budget_range_min',
        'budget_range_max', 'budget_flexibility', 'waitlist_preference', 'flexible_scheduling',
        'preferred_package_type', 'quiz_completed', 'quiz_answers', 'quiz_completed_at',
        'client_survey_completed', 'client_survey_completed_at', 'client_status',
        'client_journey_stage', 'journey_progress', 'fitness_equipment_access',
        'lifestyle_description', 'lifestyle_other', 'health_conditions', 'has_specific_event',
        'specific_event_details', 'specific_event_date'
      ];

      // Fields that don't exist in any table and should be skipped
      const invalidFields = ['profile_completion_percentage', 'certificates'];

      const profileUpdates: any = {};
      const typeSpecificUpdates: any = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (invalidFields.includes(key)) {
          console.warn(`useUserProfile: Skipping invalid field: ${key}`);
          return;
        }

        // Route to appropriate table based on user type
        if (profile.user_type === 'trainer' && trainerProfileFields.includes(key)) {
          typeSpecificUpdates[key] = value;
        } else if (profile.user_type === 'client' && clientProfileFields.includes(key)) {
          typeSpecificUpdates[key] = value;
        } else {
          profileUpdates[key] = value;
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
        const tableName = profile.user_type === 'trainer' ? 'trainer_profiles' : 
                         profile.user_type === 'client' ? 'client_profiles' : null;
        
        if (tableName) {
          const { error: typeError } = await supabase
            .from(tableName)
            .update(typeSpecificUpdates)
            .eq('id', user.id);

          if (typeError) throw typeError;
        }
      }

      return profile;
    },
    onSuccess: (_, updates) => {
      // Optimistic update - apply changes directly to cache (no refetch)
      queryClient.setQueryData(['user-profile', user?.id], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, ...updates };
      });
      
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('useUserProfile: Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (error) {
    console.error('useUserProfile: Error fetching profile:', error);
  }

  return {
    profile: profile ?? null,
    loading: isLoading,
    updateProfile: updateMutation.mutateAsync,
    refetchProfile: async () => {
      await refetch();
    },
  };
}
