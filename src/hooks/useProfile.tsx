import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'client' | 'trainer' | 'admin';

interface Profile {
  id: string;
  user_type: UserRole;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  location: string | null;
  specializations: string[] | null;
  qualifications: string[] | null;
  is_verified: boolean;
  rating: number;
  total_ratings: number;
  fitness_goals: string[] | null;
  quiz_completed: boolean;
  quiz_answers: any;
  quiz_completed_at: string | null;
  tagline: string | null;
  hourly_rate: number | null;
  training_types: string[] | null;
  terms_agreed: boolean | null;
  profile_setup_completed: boolean | null;
  client_status: 'open' | 'waitlist' | 'paused' | null;
}

export function useProfile() {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

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

      setProfile(data);
      return { data };
    } catch (error) {
      return { error };
    }
  };

  const isAdmin = () => profile?.user_type === 'admin';
  const isTrainer = () => profile?.user_type === 'trainer';
  const isClient = () => profile?.user_type === 'client';

  return {
    profile,
    loading,
    updateProfile,
    refetchProfile: fetchProfile,
    isAdmin,
    isTrainer,
    isClient,
  };
}