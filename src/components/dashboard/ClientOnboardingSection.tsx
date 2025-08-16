import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Upload, FileText, ChevronDown, ChevronUp, Bell, User, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useClientOnboarding, OnboardingStep } from '@/hooks/useClientOnboarding';
import { useAlerts } from '@/hooks/useAlerts';
import { toast } from 'sonner';

export function ClientOnboardingSection() {
  const { onboardingData, loading, markStepComplete, skipStep } = useClientOnboarding();
  const { alerts } = useAlerts();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [completingStep, setCompletingStep] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});

  // Check for template assignment notifications
  const templateAssignmentAlerts = alerts.filter(alert => 
    alert.alert_type === 'coach_update' && 
    alert.is_active && 
    alert.content?.includes('template')
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Training Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!onboardingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Training Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No training activities assigned yet. Your trainer will assign activities for you to complete once you begin working together.
          </p>
        </CardContent>
      </Card>
    );
  }

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const handleMarkComplete = async (step: OnboardingStep) => {
    if (step.completion_method !== 'client') {
      toast.error('This step must be completed by your trainer');
      return;
    }

    setCompletingStep(step.id);
    const result = await markStepComplete(
      step.id,
      notes[step.id],
      uploadedFiles[step.id]
    );

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Step marked as complete!');
      setNotes({ ...notes, [step.id]: '' });
      setUploadedFiles({ ...uploadedFiles, [step.id]: '' });
    }
    setCompletingStep(null);
  };

  const handleSkipStep = async (step: OnboardingStep) => {
    if (step.step_type === 'mandatory') {
      toast.error('Mandatory steps cannot be skipped');
      return;
    }

    const result = await skipStep(step.id, notes[step.id]);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Step skipped');
      setNotes({ ...notes, [step.id]: '' });
    }
  };

  const getStepIcon = (step: OnboardingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepStatusText = (step: OnboardingStep) => {
    switch (step.status) {
      case 'completed':
        return step.completed_at ? `Completed ${new Date(step.completed_at).toLocaleDateString()}` : 'Completed';
      case 'skipped':
        return 'Skipped';
      default:
        return step.step_type === 'mandatory' ? 'Required' : 'Optional';
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Assignment Notifications */}
      {templateAssignmentAlerts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Bell className="h-5 w-5" />
              New Templates Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templateAssignmentAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-blue-900">{alert.title}</h4>
                    <p className="text-sm text-blue-700">{alert.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="space-y-3">
            <CardTitle>Your Training Activities</CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete these activities assigned by {onboardingData.trainerName}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-blue-500" />
                <span>You complete</span>
              </div>
              <div className="flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-purple-500" />
                <span>Trainer completes</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Progress: {onboardingData.completedCount} of {onboardingData.totalCount} activities completed
              </span>
              <Badge variant="secondary">{onboardingData.percentageComplete}% Complete</Badge>
            </div>
            <Progress value={onboardingData.percentageComplete} className="h-2" />
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        {onboardingData.steps.map((step) => {
          const isExpanded = expandedSteps.has(step.id);
          const isCompleting = completingStep === step.id;
          const canComplete = step.completion_method === 'client' && step.status === 'pending';
          const canSkip = step.step_type === 'optional' && step.status === 'pending';

          return (
            <div key={step.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                {getStepIcon(step)}
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <h4 className="font-medium">{step.step_name}</h4>
                       {step.completion_method === 'client' ? (
                         <div className="flex items-center" title="You complete this activity">
                           <User className="h-4 w-4 text-blue-500" />
                         </div>
                       ) : (
                         <div className="flex items-center" title="Your trainer completes this activity">
                           <UserCheck className="h-4 w-4 text-purple-500" />
                         </div>
                       )}
                     </div>
                     <div className="flex items-center gap-2">
                       <Badge variant={step.step_type === 'mandatory' ? 'default' : 'secondary'}>
                         {getStepStatusText(step)}
                       </Badge>
                       {(step.description || step.instructions || step.requires_file_upload) && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => toggleStepExpansion(step.id)}
                         >
                           {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                         </Button>
                       )}
                     </div>
                   </div>
                  
                  {step.description && (
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  )}
                  
                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      {step.instructions && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Instructions:</h5>
                          <p className="text-sm text-muted-foreground">{step.instructions}</p>
                        </div>
                      )}
                      
                      {step.requires_file_upload && step.status === 'pending' && canComplete && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">File Upload:</h5>
                          <Input
                            type="file"
                            accept="*/*"
                            onChange={(e) => {
                              // In a real app, you'd upload to storage here
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadedFiles({ ...uploadedFiles, [step.id]: file.name });
                              }
                            }}
                          />
                        </div>
                      )}
                      
                      {step.uploaded_file_url && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4" />
                          <span>File uploaded: {step.uploaded_file_url}</span>
                        </div>
                      )}
                      
                      {step.status === 'pending' && canComplete && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Add notes (optional):</h5>
                          <Textarea
                            placeholder="Add any notes or comments..."
                            value={notes[step.id] || ''}
                            onChange={(e) => setNotes({ ...notes, [step.id]: e.target.value })}
                            className="min-h-[60px]"
                          />
                        </div>
                      )}
                      
                      {step.completion_notes && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Your notes:</h5>
                          <p className="text-sm text-muted-foreground">{step.completion_notes}</p>
                        </div>
                      )}
                      
                      {step.trainer_notes && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Trainer notes:</h5>
                          <p className="text-sm text-muted-foreground">{step.trainer_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {step.status === 'pending' && (canComplete || canSkip) && (
                <div className="flex gap-2 justify-end">
                  {canSkip && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSkipStep(step)}
                    >
                      Skip
                    </Button>
                  )}
                  {canComplete && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkComplete(step)}
                      disabled={isCompleting || (step.requires_file_upload && !uploadedFiles[step.id])}
                    >
                      {isCompleting ? 'Completing...' : 'Mark Complete'}
                    </Button>
                  )}
                </div>
              )}
              
              {step.completion_method === 'trainer' && step.status === 'pending' && (
                <p className="text-xs text-muted-foreground">
                  This step will be marked complete by your trainer
                </p>
              )}
            </div>
          );
        })}
        
        {onboardingData.steps.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No training activities assigned yet.
          </p>
        )}
        </CardContent>
      </Card>
    </div>
  );
}