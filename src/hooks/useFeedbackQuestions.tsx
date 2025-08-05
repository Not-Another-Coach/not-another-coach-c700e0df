import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FeedbackQuestion {
  id: string;
  question_text: string;
  question_type: 'free_text' | 'star_rating' | 'yes_no' | 'emoji_response' | 'toggle';
  audience: 'client' | 'pt';
  visible_to_pt: boolean;
  is_mandatory: boolean;
  display_order: number;
  is_archived: boolean;
  question_group: string;
  placeholder_text?: string;
  help_text?: string;
  options: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FeedbackResponse {
  id: string;
  discovery_call_id: string;
  question_id: string;
  response_value?: string;
  response_data: Record<string, any>;
  submitted_at: string;
}

export function useFeedbackQuestions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getQuestions = useCallback(async (audience?: 'client' | 'pt') => {
    setLoading(true);
    try {
      let query = supabase
        .from('discovery_call_feedback_questions')
        .select('*')
        .eq('is_archived', false)
        .order('display_order', { ascending: true });

      if (audience) {
        query = query.eq('audience', audience);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching questions:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuestion = useCallback(async (questionData: {
    question_text: string;
    question_type: 'free_text' | 'star_rating' | 'yes_no' | 'emoji_response' | 'toggle';
    audience: 'client' | 'pt';
    visible_to_pt: boolean;
    is_mandatory: boolean;
    display_order: number;
    question_group?: string;
    placeholder_text?: string;
    help_text?: string;
    options?: Record<string, any>;
  }) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('discovery_call_feedback_questions')
        .insert({
          ...questionData,
          options: questionData.options || {}
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating question:', error);
      return { data: null, error };
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  const updateQuestion = useCallback(async (id: string, updates: Partial<FeedbackQuestion>) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('discovery_call_feedback_questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating question:', error);
      return { data: null, error };
    } finally {
      setSubmitting(false);
    }
  }, []);

  const archiveQuestion = useCallback(async (id: string) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('discovery_call_feedback_questions')
        .update({ is_archived: true })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error archiving question:', error);
      return { data: null, error };
    } finally {
      setSubmitting(false);
    }
  }, []);

  const reorderQuestions = useCallback(async (questionIds: string[]) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc('reorder_feedback_questions', {
        question_ids: questionIds
      });

      return { error };
    } catch (error) {
      console.error('Error reordering questions:', error);
      return { error };
    } finally {
      setSubmitting(false);
    }
  }, []);

  const submitResponses = useCallback(async (
    discoveryCallId: string,
    trainerId: string,
    responses: Array<{ questionId: string; value?: string; data?: Record<string, any> }>
  ) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    setSubmitting(true);
    try {
      const responseData = responses.map(response => ({
        discovery_call_id: discoveryCallId,
        client_id: user.id,
        trainer_id: trainerId,
        question_id: response.questionId,
        response_value: response.value || null,
        response_data: response.data || {}
      }));

      const { data, error } = await supabase
        .from('discovery_call_feedback_responses')
        .upsert(responseData, {
          onConflict: 'discovery_call_id,question_id'
        })
        .select();

      return { data, error };
    } catch (error) {
      console.error('Error submitting responses:', error);
      return { data: null, error };
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  const getResponses = useCallback(async (discoveryCallId: string) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discovery_call_feedback_responses')
        .select(`
          *,
          discovery_call_feedback_questions(*)
        `)
        .eq('discovery_call_id', discoveryCallId)
        .eq('client_id', user.id);

      return { data, error };
    } catch (error) {
      console.error('Error fetching responses:', error);
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
        .from('discovery_call_feedback_responses')
        .select(`
          *,
          discovery_call_feedback_questions!inner(*),
          discovery_calls!inner(scheduled_for)
        `)
        .eq('trainer_id', user.id)
        .eq('discovery_call_feedback_questions.visible_to_pt', true)
        .order('submitted_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching trainer feedback:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    submitting,
    getQuestions,
    createQuestion,
    updateQuestion,
    archiveQuestion,
    reorderQuestions,
    submitResponses,
    getResponses,
    getTrainerFeedback
  };
}