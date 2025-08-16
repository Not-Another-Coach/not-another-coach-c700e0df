import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Types for the core sections
export interface GettingStartedTask {
  id: string;
  template_id: string;
  task_name: string;
  description?: string;
  rich_guidance?: string;
  is_mandatory: boolean;
  requires_attachment: boolean;
  attachment_types: string[];
  max_attachments: number;
  max_file_size_mb: number;
  due_days?: number;
  sla_hours?: number;
  display_order: number;
  activity_id?: string;
}

export interface FirstWeekTask {
  id: string;
  template_id: string;
  task_name: string;
  description?: string;
  rich_guidance?: string;
  is_mandatory: boolean;
  requires_attachment: boolean;
  attachment_types: string[];
  max_attachments: number;
  max_file_size_mb: number;
  due_days?: number;
  sla_hours?: number;
  display_order: number;
  activity_id?: string;
}

export interface OngoingSupportSettings {
  id: string;
  template_id: string;
  check_in_frequency?: string;
  check_in_day?: string;
  check_in_time?: string;
  check_in_duration?: number;
  progress_tracking_frequency?: string;
  communication_channels: string[];
  preferred_communication_channel?: string;
  trainer_response_time_hours: number;
  client_response_expectations?: string;
  emergency_contact_method?: string;
  session_rescheduling_policy?: string;
  cancellation_policy?: string;
}

export interface CommitmentExpectation {
  id: string;
  template_id: string;
  commitment_type: 'trainer' | 'client' | 'mutual';
  commitment_title: string;
  commitment_description: string;
  requires_acknowledgment: boolean;
  requires_signature: boolean;
  display_order: number;
}

export interface TrainerNote {
  id: string;
  template_id: string;
  note_type: 'setup_action' | 'reminder' | 'client_info' | 'preparation';
  title: string;
  content: string;
  is_checklist_item: boolean;
  due_before_client_start: boolean;
  priority: 'low' | 'medium' | 'high';
  estimated_time_minutes?: number;
  display_order: number;
}

export function useOnboardingSections() {
  const { user } = useAuth();
  const [gettingStartedTasks, setGettingStartedTasks] = useState<GettingStartedTask[]>([]);
  const [firstWeekTasks, setFirstWeekTasks] = useState<FirstWeekTask[]>([]);
  const [ongoingSupportSettings, setOngoingSupportSettings] = useState<OngoingSupportSettings[]>([]);
  const [commitments, setCommitments] = useState<CommitmentExpectation[]>([]);
  const [trainerNotes, setTrainerNotes] = useState<TrainerNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Getting Started Tasks
  const fetchGettingStartedTasks = useCallback(async (templateId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_getting_started')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      if (error) throw error;
      setGettingStartedTasks((data || []).map(task => ({
        ...task,
        attachment_types: Array.isArray(task.attachment_types) ? task.attachment_types as string[] : []
      })));
    } catch (err) {
      console.error('Error fetching getting started tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    }
  }, [user]);

  const createGettingStartedTask = useCallback(async (templateId: string, task: Omit<GettingStartedTask, 'id' | 'template_id'>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_getting_started')
        .insert({
          template_id: templateId,
          ...task
        });

      if (error) throw error;
      await fetchGettingStartedTasks(templateId);
    } catch (err) {
      console.error('Error creating getting started task:', err);
      throw err;
    }
  }, [user, fetchGettingStartedTasks]);

  const updateGettingStartedTask = useCallback(async (taskId: string, updates: Partial<GettingStartedTask>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_getting_started')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating getting started task:', err);
      throw err;
    }
  }, [user]);

  const deleteGettingStartedTask = useCallback(async (taskId: string) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_getting_started')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting getting started task:', err);
      throw err;
    }
  }, [user]);

  // First Week Tasks
  const fetchFirstWeekTasks = useCallback(async (templateId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_first_week')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      if (error) throw error;
      setFirstWeekTasks((data || []).map(task => ({
        ...task,
        attachment_types: Array.isArray(task.attachment_types) ? task.attachment_types as string[] : []
      })));
    } catch (err) {
      console.error('Error fetching first week tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load first week tasks');
    }
  }, [user]);

  const createFirstWeekTask = useCallback(async (templateId: string, task: Omit<FirstWeekTask, 'id' | 'template_id'>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_first_week')
        .insert({
          template_id: templateId,
          ...task
        });

      if (error) throw error;
      await fetchFirstWeekTasks(templateId);
    } catch (err) {
      console.error('Error creating first week task:', err);
      throw err;
    }
  }, [user, fetchFirstWeekTasks]);

  const updateFirstWeekTask = useCallback(async (taskId: string, updates: Partial<FirstWeekTask>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_first_week')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating first week task:', err);
      throw err;
    }
  }, [user]);

  const deleteFirstWeekTask = useCallback(async (taskId: string) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_first_week')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting first week task:', err);
      throw err;
    }
  }, [user]);

  // Ongoing Support Settings
  const fetchOngoingSupportSettings = useCallback(async (templateId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_ongoing_support')
        .select('*')
        .eq('template_id', templateId);

      if (error) throw error;
      setOngoingSupportSettings((data || []).map(settings => ({
        ...settings,
        communication_channels: Array.isArray(settings.communication_channels) ? settings.communication_channels as string[] : []
      })));
    } catch (err) {
      console.error('Error fetching ongoing support settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    }
  }, [user]);

  const createOngoingSupportSettings = useCallback(async (templateId: string, settings: Omit<OngoingSupportSettings, 'id' | 'template_id'>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_ongoing_support')
        .insert({
          template_id: templateId,
          ...settings
        });

      if (error) throw error;
      await fetchOngoingSupportSettings(templateId);
    } catch (err) {
      console.error('Error creating ongoing support settings:', err);
      throw err;
    }
  }, [user, fetchOngoingSupportSettings]);

  const updateOngoingSupportSettings = useCallback(async (settingsId: string, updates: Partial<OngoingSupportSettings>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_ongoing_support')
        .update(updates)
        .eq('id', settingsId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating ongoing support settings:', err);
      throw err;
    }
  }, [user]);

  // Commitments & Expectations
  const fetchCommitments = useCallback(async (templateId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_commitments')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      if (error) throw error;
      setCommitments((data || []).map(commitment => ({
        ...commitment,
        commitment_type: commitment.commitment_type as 'trainer' | 'client' | 'mutual'
      })));
    } catch (err) {
      console.error('Error fetching commitments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load commitments');
    }
  }, [user]);

  const createCommitment = useCallback(async (templateId: string, commitment: Omit<CommitmentExpectation, 'id' | 'template_id'>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_commitments')
        .insert({
          template_id: templateId,
          ...commitment
        });

      if (error) throw error;
      await fetchCommitments(templateId);
    } catch (err) {
      console.error('Error creating commitment:', err);
      throw err;
    }
  }, [user, fetchCommitments]);

  const updateCommitment = useCallback(async (commitmentId: string, updates: Partial<CommitmentExpectation>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_commitments')
        .update(updates)
        .eq('id', commitmentId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating commitment:', err);
      throw err;
    }
  }, [user]);

  const deleteCommitment = useCallback(async (commitmentId: string) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_commitments')
        .delete()
        .eq('id', commitmentId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting commitment:', err);
      throw err;
    }
  }, [user]);

  // Trainer Notes
  const fetchTrainerNotes = useCallback(async (templateId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_trainer_notes')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      if (error) throw error;
      setTrainerNotes((data || []).map(note => ({
        ...note,
        note_type: note.note_type as 'setup_action' | 'reminder' | 'client_info' | 'preparation',
        priority: note.priority as 'low' | 'medium' | 'high'
      })));
    } catch (err) {
      console.error('Error fetching trainer notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    }
  }, [user]);

  const createTrainerNote = useCallback(async (templateId: string, note: Omit<TrainerNote, 'id' | 'template_id'>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_trainer_notes')
        .insert({
          template_id: templateId,
          ...note
        });

      if (error) throw error;
      await fetchTrainerNotes(templateId);
    } catch (err) {
      console.error('Error creating trainer note:', err);
      throw err;
    }
  }, [user, fetchTrainerNotes]);

  const updateTrainerNote = useCallback(async (noteId: string, updates: Partial<TrainerNote>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_trainer_notes')
        .update(updates)
        .eq('id', noteId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating trainer note:', err);
      throw err;
    }
  }, [user]);

  const deleteTrainerNote = useCallback(async (noteId: string) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('onboarding_trainer_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting trainer note:', err);
      throw err;
    }
  }, [user]);

  // Load all sections for a template
  const loadAllSections = useCallback(async (templateId: string) => {
    if (!templateId) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchGettingStartedTasks(templateId),
        fetchFirstWeekTasks(templateId),
        fetchOngoingSupportSettings(templateId),
        fetchCommitments(templateId),
        fetchTrainerNotes(templateId)
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  }, [fetchGettingStartedTasks, fetchFirstWeekTasks, fetchOngoingSupportSettings, fetchCommitments, fetchTrainerNotes]);

  return {
    // State
    gettingStartedTasks,
    firstWeekTasks,
    ongoingSupportSettings,
    commitments,
    trainerNotes,
    loading,
    error,

    // Getting Started
    fetchGettingStartedTasks,
    createGettingStartedTask,
    updateGettingStartedTask,
    deleteGettingStartedTask,

    // First Week
    fetchFirstWeekTasks,
    createFirstWeekTask,
    updateFirstWeekTask,
    deleteFirstWeekTask,

    // Ongoing Support
    fetchOngoingSupportSettings,
    createOngoingSupportSettings,
    updateOngoingSupportSettings,

    // Commitments
    fetchCommitments,
    createCommitment,
    updateCommitment,
    deleteCommitment,

    // Trainer Notes
    fetchTrainerNotes,
    createTrainerNote,
    updateTrainerNote,
    deleteTrainerNote,

    // Utility
    loadAllSections
  };
}