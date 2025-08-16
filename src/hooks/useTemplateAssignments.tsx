import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TemplateAssignment {
  id: string;
  client_id: string;
  trainer_id: string;
  template_name: string;
  template_base_id?: string;
  assigned_at: string;
  status: string;
  expired_at?: string;
  removed_at?: string;
  assignment_notes?: string;
  expiry_reason?: string;
  removal_reason?: string;
  correlation_id: string;
}

export function useTemplateAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<TemplateAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('client_template_assignments')
        .select('*')
        .eq('trainer_id', user.id)
        .order('assigned_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching template assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user?.id]);

  const getActiveAssignmentForClient = (clientId: string): TemplateAssignment | null => {
    return assignments.find(a => a.client_id === clientId && a.status === 'active') || null;
  };

  const hasActiveAssignment = (clientId: string): boolean => {
    return getActiveAssignmentForClient(clientId) !== null;
  };

  const expireAssignment = async (assignmentId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('client_template_assignments')
        .update({
          status: 'expired',
          expired_at: new Date().toISOString(),
          expiry_reason: reason || 'Expired by trainer'
        })
        .eq('id', assignmentId);

      if (error) throw error;
      
      await fetchAssignments(); // Refresh data
      return { success: true };
    } catch (err) {
      console.error('Error expiring assignment:', err);
      return { error: err instanceof Error ? err.message : 'Failed to expire assignment' };
    }
  };

  const removeAssignment = async (assignmentId: string, reason?: string) => {
    try {
      // First delete all associated progress records
      const { error: progressError } = await supabase
        .from('client_onboarding_progress')
        .delete()
        .eq('assignment_id', assignmentId);

      if (progressError) throw progressError;

      // Then update assignment status to removed
      const { error } = await supabase
        .from('client_template_assignments')
        .update({
          status: 'removed',
          removed_at: new Date().toISOString(),
          removal_reason: reason || 'Removed by trainer',
          removed_by: user?.id
        })
        .eq('id', assignmentId);

      if (error) throw error;
      
      await fetchAssignments(); // Refresh data
      return { success: true };
    } catch (err) {
      console.error('Error removing assignment:', err);
      return { error: err instanceof Error ? err.message : 'Failed to remove assignment' };
    }
  };

  return {
    assignments,
    loading,
    error,
    refetch: fetchAssignments,
    getActiveAssignmentForClient,
    hasActiveAssignment,
    expireAssignment,
    removeAssignment
  };
}