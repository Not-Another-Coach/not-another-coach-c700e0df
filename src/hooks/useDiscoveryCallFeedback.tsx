import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DiscoveryCallFeedback {
  id: string;
  discovery_call_id: string;
  client_id: string;
  trainer_id: string;
  
  // Private feedback
  comfort_level?: 'positive' | 'neutral' | 'negative';
  would_consider_training?: 'yes' | 'maybe' | 'no';
  what_stood_out?: string;
  comparison_notes?: string;
  
  // Coach feedback
  conversation_helpful?: number;
  asked_right_questions?: number;
  professionalism?: number;
  share_with_coach: boolean;
  coach_notes?: string;
  
  submitted_at: string;
  coach_viewed_at?: string;
}

export function useDiscoveryCallFeedback() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = useCallback(async (
    discoveryCallId: string,
    trainerId: string,
    feedback: Partial<DiscoveryCallFeedback>
  ) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('discovery_call_feedback')
        .upsert({
          discovery_call_id: discoveryCallId,
          client_id: user.id,
          trainer_id: trainerId,
          ...feedback
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { data: null, error };
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  const getFeedback = useCallback(async (discoveryCallId: string) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discovery_call_feedback')
        .select('*')
        .eq('discovery_call_id', discoveryCallId)
        .eq('client_id', user.id)
        .maybeSingle();

      return { data, error };
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getTrainerFeedback = useCallback(async () => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discovery_call_feedback')
        .select(`
          *,
          discovery_calls!inner(scheduled_for)
        `)
        .eq('trainer_id', user.id)
        .eq('share_with_coach', true)
        .order('submitted_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching trainer feedback:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markFeedbackAsViewed = useCallback(async (feedbackId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('discovery_call_feedback')
        .update({ coach_viewed_at: new Date().toISOString() })
        .eq('id', feedbackId)
        .eq('trainer_id', user.id);
    } catch (error) {
      console.error('Error marking feedback as viewed:', error);
    }
  }, [user]);

  return {
    loading,
    submitting,
    submitFeedback,
    getFeedback,
    getTrainerFeedback,
    markFeedbackAsViewed
  };
}