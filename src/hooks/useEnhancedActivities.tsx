import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface EnhancedActivity {
  id: string;
  trainer_id?: string;
  activity_name: string;
  description?: string;
  category: string;
  activity_type: 'task' | 'appointment' | 'survey' | 'training_content' | 'file_upload';
  appointment_config?: any;
  survey_config?: any;
  content_config?: any;
  upload_config?: any;
  default_due_days?: number;
  default_sla_days?: number;
  requires_file_upload: boolean;
  completion_method: string;
  instructions?: string;
  guidance_html?: string;
}

export interface ActivityCompletion {
  id: string;
  activity_id: string;
  client_id: string;
  trainer_id: string;
  template_assignment_id: string;
  activity_type: string;
  completion_data: any;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  due_at?: string;
  sla_due_at?: string;
}

export interface ActivityAppointment {
  id: string;
  activity_id: string;
  client_id: string;
  trainer_id: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link?: string;
  calendar_event_id?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  client_notes?: string;
  trainer_notes?: string;
}

export const useEnhancedActivities = () => {
  const [activities, setActivities] = useState<EnhancedActivity[]>([]);
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [appointments, setAppointments] = useState<ActivityAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchActivities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch both trainer's own activities and system activities
      const { data, error } = await supabase
        .from('trainer_onboarding_activities')
        .select('*')
        .or(`trainer_id.eq.${user.id},is_system.eq.true`)
        .order('category', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setActivities((data || []) as EnhancedActivity[]);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData: Partial<EnhancedActivity>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trainer_onboarding_activities')
        .insert({
          activity_name: activityData.activity_name || '',
          trainer_id: user.id,
          category: activityData.category || 'Onboarding',
          activity_type: activityData.activity_type || 'task',
          description: activityData.description,
          completion_method: activityData.completion_method || 'client',
          requires_file_upload: activityData.requires_file_upload || false,
          default_due_days: activityData.default_due_days,
          default_sla_days: activityData.default_sla_days,
          instructions: activityData.instructions,
          guidance_html: activityData.guidance_html,
          appointment_config: activityData.appointment_config || {},
          survey_config: activityData.survey_config || {},
          content_config: activityData.content_config || {},
          upload_config: activityData.upload_config || {}
        })
        .select()
        .single();

      if (error) throw error;
      
      setActivities(prev => [...prev, data as EnhancedActivity]);
      toast({
        title: "Activity Created",
        description: `${data.activity_name} has been added to your activities.`,
      });
      
      return data;
    } catch (err) {
      console.error('Error creating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to create activity');
      throw err;
    }
  };

  const updateActivity = async (activityId: string, updates: Partial<EnhancedActivity>) => {
    try {
      const { data, error } = await supabase
        .from('trainer_onboarding_activities')
        .update(updates)
        .eq('id', activityId)
        .select()
        .single();

      if (error) throw error;
      
      setActivities(prev => prev.map(activity => 
        activity.id === activityId ? { ...activity, ...data } as EnhancedActivity : activity
      ));
      
      toast({
        title: "Activity Updated",
        description: "Activity has been updated successfully.",
      });
      
      return data;
    } catch (err) {
      console.error('Error updating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to update activity');
      throw err;
    }
  };

  const scheduleAppointment = async (appointmentData: any) => {
    try {
      const { data, error } = await supabase
        .from('activity_appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) throw error;
      
      setAppointments(prev => [...prev, data as ActivityAppointment]);
      toast({
        title: "Appointment Scheduled",
        description: "Appointment has been scheduled successfully.",
      });
      
      return data;
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule appointment');
      throw err;
    }
  };

  const updateCompletion = async (completionId: string, updates: Partial<ActivityCompletion>) => {
    try {
      const { data, error } = await supabase
        .from('activity_completions')
        .update(updates)
        .eq('id', completionId)
        .select()
        .single();

      if (error) throw error;
      
      setCompletions(prev => prev.map(completion => 
        completion.id === completionId ? { ...completion, ...data } as ActivityCompletion : completion
      ));
      
      return data;
    } catch (err) {
      console.error('Error updating completion:', err);
      setError(err instanceof Error ? err.message : 'Failed to update completion');
      throw err;
    }
  };

  const fetchClientCompletions = async (clientId: string, templateAssignmentId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('activity_completions')
        .select(`
          *,
          trainer_onboarding_activities (
            activity_name,
            activity_type,
            appointment_config,
            survey_config,
            content_config,
            upload_config
          )
        `)
        .eq('client_id', clientId)
        .eq('trainer_id', user.id)
        .eq('template_assignment_id', templateAssignmentId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching client completions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch completions');
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  return {
    activities,
    completions,
    appointments,
    loading,
    error,
    createActivity,
    updateActivity,
    scheduleAppointment,
    updateCompletion,
    fetchClientCompletions,
    refresh: fetchActivities,
  };
};