import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Calendar, Upload, FileText, Clock, ChevronRight } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';

interface TaskStep {
  id: string;
  activity_name: string;
  activity_type: 'task' | 'appointment' | 'survey' | 'training_content' | 'file_upload';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  due_at?: string;
  description?: string;
}

interface TodaysNextStepsProps {
  steps: TaskStep[];
  onTaskClick: (step: TaskStep) => void;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'appointment': return Calendar;
    case 'survey': return CheckSquare;
    case 'training_content': return FileText;
    case 'file_upload': return Upload;
    default: return CheckSquare;
  }
};

const getPriorityColor = (step: TaskStep) => {
  if (step.due_at && isPast(new Date(step.due_at))) {
    return 'border-l-destructive bg-destructive/5';
  }
  if (step.due_at && isToday(new Date(step.due_at))) {
    return 'border-l-accent bg-accent/5';
  }
  if (step.status === 'in_progress') {
    return 'border-l-primary bg-primary/5';
  }
  return 'border-l-muted bg-background';
};

const getActionText = (type: string) => {
  switch (type) {
    case 'appointment': return 'Schedule';
    case 'survey': return 'Complete';
    case 'training_content': return 'View';
    case 'file_upload': return 'Upload';
    default: return 'Complete';
  }
};

export const TodaysNextSteps = ({ steps, onTaskClick }: TodaysNextStepsProps) => {
  // Filter and sort tasks - prioritize overdue, today, in progress, then by due date
  const prioritizedTasks = steps
    .filter(step => step.status !== 'completed' && step.status !== 'skipped')
    .sort((a, b) => {
      // Overdue tasks first
      const aOverdue = a.due_at && isPast(new Date(a.due_at));
      const bOverdue = b.due_at && isPast(new Date(b.due_at));
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Today's tasks next
      const aToday = a.due_at && isToday(new Date(a.due_at));
      const bToday = b.due_at && isToday(new Date(b.due_at));
      if (aToday && !bToday) return -1;
      if (!aToday && bToday) return 1;
      
      // In progress tasks
      if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
      if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
      
      // Sort by due date
      if (a.due_at && b.due_at) {
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      }
      if (a.due_at) return -1;
      if (b.due_at) return 1;
      
      return 0;
    })
    .slice(0, 3); // Show top 3 priority tasks - less overwhelming

  if (prioritizedTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-success-600" />
            Today's Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-success-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
            <p className="text-muted-foreground">No pending tasks for today. Great job!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          Your Focus Tasks
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Top {Math.min(prioritizedTasks.length, 3)} priority actions for today
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prioritizedTasks.map((step) => {
            const Icon = getActivityIcon(step.activity_type);
            const isOverdue = step.due_at && isPast(new Date(step.due_at));
            const isDueToday = step.due_at && isToday(new Date(step.due_at));
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-4 border-l-4 rounded-lg cursor-pointer hover:shadow-sm transition-all ${getPriorityColor(step)}`}
                onClick={() => onTaskClick(step)}
              >
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">
                      {step.activity_name}
                    </h4>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs">Overdue</Badge>
                    )}
                    {isDueToday && !isOverdue && (
                      <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">Due Today</Badge>
                    )}
                    {step.status === 'in_progress' && (
                      <Badge variant="outline" className="text-xs text-primary border-primary">In Progress</Badge>
                    )}
                  </div>
                  
                  {step.description && (
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {step.description}
                    </p>
                  )}
                  
                  {step.due_at && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Due {format(new Date(step.due_at), 'MMM d, h:mm a')}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    {getActionText(step.activity_type)}
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};