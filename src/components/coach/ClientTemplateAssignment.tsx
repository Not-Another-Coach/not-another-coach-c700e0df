import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Clock, FileText, AlertCircle, CheckCircle, Trash2, Archive, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { ClientTemplateAssignmentButtons } from '@/components/coach/ClientTemplateAssignmentButtons';

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
  client_profile?: {
    first_name?: string;
    last_name?: string;
  };
  progress_count?: number;
  completed_count?: number;
}

interface ClientTemplateAssignmentProps {
  clientId?: string; // If provided, shows assignments for specific client
  showHistoryOnly?: boolean; // If true, show compact history view with assign CTA
}

export function ClientTemplateAssignment({ clientId, showHistoryOnly = false }: ClientTemplateAssignmentProps) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<TemplateAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<TemplateAssignment | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'expire' | 'remove'>('expire');
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showExpandedHistory, setShowExpandedHistory] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [clientForAssignment, setClientForAssignment] = useState<{ id: string; first_name: string; last_name: string } | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
    }
  }, [user?.id, clientId]);

  const fetchAssignments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('client_template_assignments')
        .select('*')
        .eq('trainer_id', user.id)
        .order('assigned_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data: assignmentsData, error } = await query;

      if (error) throw error;

      console.log('Fetched assignments:', assignmentsData);

      // Get client profiles and progress counts for each assignment
      const assignmentsWithProgress = await Promise.all(
        (assignmentsData || []).map(async (assignment) => {
          // Get client profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', assignment.client_id)
            .single();

          // Get progress data
          const { data: progressData } = await supabase
            .from('client_onboarding_progress')
            .select('status')
            .eq('assignment_id', assignment.id);

          const progressCount = progressData?.length || 0;
          const completedCount = progressData?.filter(p => p.status === 'completed').length || 0;

          return {
            ...assignment,
            client_profile: profileData,
            progress_count: progressCount,
            completed_count: completedCount
          } as TemplateAssignment;
        })
      );

      console.log('Assignments with profiles and progress:', assignmentsWithProgress);
      setAssignments(assignmentsWithProgress);
    } catch (error) {
      console.error('Error fetching template assignments:', error);
      toast.error('Failed to load template assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleExpireAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      setProcessing(true);

      const { error } = await supabase
        .from('client_template_assignments')
        .update({
          status: 'expired',
          expired_at: new Date().toISOString(),
          expiry_reason: actionReason || 'Expired by trainer'
        })
        .eq('id', selectedAssignment.id);

      if (error) throw error;

      toast.success('Template assignment expired successfully');
      setShowActionDialog(false);
      setSelectedAssignment(null);
      setActionReason('');
      fetchAssignments();
    } catch (error) {
      console.error('Error expiring assignment:', error);
      toast.error('Failed to expire assignment');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      setProcessing(true);

      // Delete all associated progress records
      const { error: progressError } = await supabase
        .from('client_onboarding_progress')
        .delete()
        .eq('assignment_id', selectedAssignment.id);

      if (progressError) throw progressError;

      // Update assignment status to removed
      const { error: assignmentError } = await supabase
        .from('client_template_assignments')
        .update({
          status: 'removed',
          removed_at: new Date().toISOString(),
          removal_reason: actionReason || 'Removed by trainer',
          removed_by: user?.id
        })
        .eq('id', selectedAssignment.id);

      if (assignmentError) throw assignmentError;

      toast.success('Template assignment and all history removed successfully');
      setShowActionDialog(false);
      setSelectedAssignment(null);
      setActionReason('');
      fetchAssignments();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment');
    } finally {
      setProcessing(false);
    }
  };

  const openActionDialog = (assignment: TemplateAssignment, type: 'expire' | 'remove') => {
    setSelectedAssignment(assignment);
    setActionType(type);
    setActionReason('');
    setShowActionDialog(true);
  };

  const getStatusBadge = (assignment: TemplateAssignment) => {
    switch (assignment.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Expired</Badge>;
      case 'removed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Removed</Badge>;
      default:
        return <Badge variant="outline">{assignment.status}</Badge>;
    }
  };

  const getProgressBadge = (assignment: TemplateAssignment) => {
    if (!assignment.progress_count) return null;
    
    const percentage = Math.round((assignment.completed_count / assignment.progress_count) * 100);
    
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle className="w-4 h-4" />
        <span>{assignment.completed_count}/{assignment.progress_count} completed ({percentage}%)</span>
      </div>
    );
  };

  if (loading) {
    if (showHistoryOnly) {
      return (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-8 bg-muted rounded"></div>
        </div>
      );
    }
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showHistoryOnly) {
    const activeAssignment = assignments.find(a => a.status === 'active');
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Template Assignment</h4>
          <Button
            size="sm"
            onClick={() => {
              console.log('Assign Template clicked, clientId:', clientId);
              if (clientId) {
                // Get client profile for assignment dialog
                const clientProfile = activeAssignment?.client_profile || 
                  assignments[0]?.client_profile;
                
                console.log('Client profile found:', clientProfile);
                
                if (clientProfile?.first_name && clientProfile?.last_name) {
                  setClientForAssignment({
                    id: clientId,
                    first_name: clientProfile.first_name,
                    last_name: clientProfile.last_name
                  });
                  setShowAssignDialog(true);
                  console.log('Opening assignment dialog for:', clientProfile);
                } else {
                  // Fallback - fetch client profile
                  console.log('Fetching client profile for:', clientId);
                  fetchClientProfile(clientId);
                }
              } else {
                console.log('No clientId, redirecting to template management');
                window.location.href = '/trainer/dashboard?tab=template-management&section=assign';
              }
            }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Assign Template
          </Button>
        </div>
        
        {activeAssignment ? (
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default">Active</Badge>
              <span className="font-medium">{activeAssignment.template_name}</span>
            </div>
            <p className="text-muted-foreground">
              Assigned {format(new Date(activeAssignment.assigned_at), 'MMM d, yyyy')}
            </p>
            {getProgressBadge(activeAssignment)}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No active template assigned
          </div>
        )}
        
        {assignments.length > 0 && (
          <div className="space-y-2">
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-xs flex items-center gap-1"
              onClick={() => setShowExpandedHistory(!showExpandedHistory)}
            >
              {showExpandedHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showExpandedHistory ? 'Hide' : 'View'} History ({assignments.length})
            </Button>
            
            {showExpandedHistory && (
              <div className="space-y-2 mt-2 pt-2 border-t">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="text-xs text-muted-foreground border-l-2 border-muted pl-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(assignment)}
                      <span className="font-medium">{assignment.template_name}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Assigned {format(new Date(assignment.assigned_at), 'MMM d')}
                      {assignment.status === 'active' && assignment.progress_count && (
                        <span className="ml-2">• {assignment.completed_count}/{assignment.progress_count} completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const fetchClientProfile = async (clientId: string) => {
    try {
      console.log('Fetching profile for client:', clientId);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', clientId)
        .single();

      if (error) throw error;

      console.log('Fetched client profile:', profileData);

      if (profileData) {
        setClientForAssignment({
          id: clientId,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || ''
        });
        setShowAssignDialog(true);
        console.log('Setting up assignment dialog for client:', profileData);
      }
    } catch (error) {
      console.error('Error fetching client profile:', error);
      toast.error('Failed to load client information');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Template Assignments {clientId ? '' : `(${assignments.length})`}
          </CardTitle>
          {!clientId && (
            <p className="text-sm text-muted-foreground">
              Manage template assignments for your clients
            </p>
          )}
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No template assignments</h3>
              <p className="text-sm text-muted-foreground">
                {clientId ? 'No templates assigned to this client yet.' : 'No templates have been assigned to clients yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{assignment.template_name}</h4>
                        {getStatusBadge(assignment)}
                      </div>
                      
                      {!clientId && assignment.client_profile && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Client:</strong> {assignment.client_profile.first_name} {assignment.client_profile.last_name}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Assigned {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
                        </span>
                      </div>

                      {assignment.status === 'expired' && assignment.expired_at && (
                        <div className="flex items-center gap-1 text-sm text-yellow-600">
                          <AlertCircle className="w-3 h-3" />
                          Expired {format(new Date(assignment.expired_at), 'MMM d, yyyy')}
                          {assignment.expiry_reason && <span> - {assignment.expiry_reason}</span>}
                        </div>
                      )}

                      {assignment.status === 'removed' && assignment.removed_at && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <AlertCircle className="w-3 h-3" />
                          Removed {format(new Date(assignment.removed_at), 'MMM d, yyyy')}
                          {assignment.removal_reason && <span> - {assignment.removal_reason}</span>}
                        </div>
                      )}

                      {assignment.status === 'active' && getProgressBadge(assignment)}

                      {assignment.assignment_notes && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {assignment.assignment_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {assignment.status === 'active' && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openActionDialog(assignment, 'expire')}
                      >
                        <Archive className="w-3 h-3 mr-1" />
                        Expire
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openActionDialog(assignment, 'remove')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'expire' ? 'Expire' : 'Remove'} Template Assignment
            </DialogTitle>
            <DialogDescription>
              {actionType === 'expire' 
                ? 'Expiring this assignment will keep all history but mark it as inactive. The client will no longer see active tasks from this template.'
                : 'Removing this assignment will permanently delete all associated progress and history. This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for {actionType === 'expire' ? 'expiring' : 'removing'}</Label>
              <Textarea
                id="reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={`Explain why you are ${actionType === 'expire' ? 'expiring' : 'removing'} this assignment...`}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'remove' ? 'destructive' : 'default'}
                onClick={actionType === 'expire' ? handleExpireAssignment : handleRemoveAssignment}
                disabled={processing}
              >
                {processing ? 'Processing...' : (actionType === 'expire' ? 'Expire Assignment' : 'Remove Assignment')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Assignment Dialog */}
      {clientForAssignment && (
        <TemplateAssignmentDialog
          client={clientForAssignment}
          isOpen={showAssignDialog}
          onClose={() => {
            setShowAssignDialog(false);
            setClientForAssignment(null);
          }}
          onAssignmentComplete={() => {
            fetchAssignments();
          }}
        />
      )}
    </>
  );
}