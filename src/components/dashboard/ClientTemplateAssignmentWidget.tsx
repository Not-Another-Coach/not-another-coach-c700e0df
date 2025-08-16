import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { FileText, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ClientTemplateAssignment {
  id: string;
  template_name: string;
  assigned_at: string;
  status: string;
  assignment_notes?: string;
  trainer_profile?: {
    first_name?: string;
    last_name?: string;
  };
  progress_tasks?: {
    total: number;
    completed: number;
    pending: number;
  };
}

export function ClientTemplateAssignmentWidget() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<ClientTemplateAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
    }
  }, [user?.id]);

  const fetchAssignments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Get active template assignments for the client
      const { data: assignmentsData, error } = await supabase
        .from('client_template_assignments')
        .select('*')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      // Enrich with trainer profile and progress data
      const enrichedAssignments = await Promise.all(
        (assignmentsData || []).map(async (assignment) => {
          // Get trainer profile
          const { data: trainerProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', assignment.trainer_id)
            .single();

          // Get progress data
          const { data: progressData } = await supabase
            .from('client_onboarding_progress')
            .select('status')
            .eq('assignment_id', assignment.id);

          const total = progressData?.length || 0;
          const completed = progressData?.filter(p => p.status === 'completed').length || 0;
          const pending = total - completed;

          return {
            ...assignment,
            trainer_profile: trainerProfile,
            progress_tasks: { total, completed, pending }
          } as ClientTemplateAssignment;
        })
      );

      setAssignments(enrichedAssignments);
    } catch (error) {
      console.error('Error fetching template assignments:', error);
      toast.error('Failed to load template assignments');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (assignment: ClientTemplateAssignment) => {
    if (!assignment.progress_tasks?.total) return 0;
    return Math.round((assignment.progress_tasks.completed / assignment.progress_tasks.total) * 100);
  };

  const navigateToOnboarding = () => {
    // This would navigate to the onboarding section
    // For now, we'll just show a message
    toast.info('Navigate to onboarding section to view your tasks');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Training Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No active templates</h3>
            <p className="text-sm text-muted-foreground">
              Your trainer hasn't assigned any onboarding templates yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Training Templates ({assignments.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your assigned onboarding templates and progress
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.map((assignment) => {
          const progressPercentage = getProgressPercentage(assignment);
          
          return (
            <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{assignment.template_name}</h4>
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Active
                    </Badge>
                  </div>
                  
                  {assignment.trainer_profile && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Assigned by:</strong> {assignment.trainer_profile.first_name} {assignment.trainer_profile.last_name}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Assigned {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {assignment.assignment_notes && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {assignment.assignment_notes}
                    </p>
                  )}

                  {assignment.progress_tasks && assignment.progress_tasks.total > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progressPercentage}% complete</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {assignment.progress_tasks.completed} completed
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {assignment.progress_tasks.pending} pending
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  {assignment.progress_tasks?.total ? 
                    `${assignment.progress_tasks.total} task${assignment.progress_tasks.total === 1 ? '' : 's'} total` : 
                    'No tasks available'
                  }
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={navigateToOnboarding}
                >
                  View Tasks
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}