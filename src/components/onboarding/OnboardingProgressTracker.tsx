import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, Lock, Calendar, Upload, FileText, Link as LinkIcon } from 'lucide-react';

interface OnboardingStep {
  id: string;
  activity_name: string;
  activity_type: 'task' | 'appointment' | 'survey' | 'training_content' | 'file_upload';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  due_at?: string;
  description?: string;
}

interface OnboardingProgressTrackerProps {
  steps: OnboardingStep[];
  onStepClick: (step: OnboardingStep) => void;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'appointment': return Calendar;
    case 'survey': return LinkIcon;
    case 'training_content': return FileText;
    case 'file_upload': return Upload;
    default: return FileText;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'in_progress': return Clock;
    case 'skipped': return Circle;
    default: return Circle;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-success-600 bg-success-50 border-success-200';
    case 'in_progress': return 'text-accent-600 bg-accent-50 border-accent-200';
    case 'skipped': return 'text-muted-foreground bg-muted border-muted';
    default: return 'text-primary-600 bg-primary-50 border-primary-200';
  }
};

const getStepColor = (status: string, index: number, currentIndex: number) => {
  if (status === 'completed') return 'bg-success-100 border-success-300';
  if (status === 'in_progress') return 'bg-accent-100 border-accent-300';
  if (index > currentIndex) return 'bg-muted border-muted';
  return 'bg-primary-100 border-primary-300';
};

export const OnboardingProgressTracker = ({ steps, onStepClick }: OnboardingProgressTrackerProps) => {
  const currentIndex = steps.findIndex(step => step.status === 'in_progress' || step.status === 'pending');
  const activeIndex = currentIndex >= 0 ? currentIndex : steps.length - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Your Onboarding Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Desktop horizontal stepper */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between mb-6">
              {steps.slice(0, 5).map((step, index) => {
                const StatusIcon = getStatusIcon(step.status);
                const ActivityIcon = getActivityIcon(step.activity_type);
                
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div 
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${getStepColor(step.status, index, activeIndex)}`}
                      onClick={() => onStepClick(step)}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6 text-success-600" />
                      ) : (
                        <ActivityIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center mt-2 max-w-20">
                      <p className="text-xs font-medium text-foreground truncate">
                        {step.activity_name}
                      </p>
                      <Badge variant="outline" className={`text-xs mt-1 ${getStatusColor(step.status)}`}>
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {index < Math.min(steps.length - 1, 4) && (
                      <div className="w-full h-0.5 bg-muted absolute mt-6 ml-6" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile vertical list */}
          <div className="md:hidden space-y-3">
            {steps.slice(0, 5).map((step, index) => {
              const StatusIcon = getStatusIcon(step.status);
              const ActivityIcon = getActivityIcon(step.activity_type);
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${getStepColor(step.status, index, activeIndex)}`}
                  onClick={() => onStepClick(step)}
                >
                  <div className="flex-shrink-0">
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-6 w-6 text-success-600" />
                    ) : (
                      <ActivityIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{step.activity_name}</p>
                    {step.description && (
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={getStatusColor(step.status)}>
                    {step.status.replace('_', ' ')}
                  </Badge>
                </div>
              );
            })}
          </div>

          {steps.length > 5 && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                +{steps.length - 5} more steps to complete
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};