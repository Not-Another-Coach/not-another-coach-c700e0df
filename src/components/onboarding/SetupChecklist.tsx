import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  User, 
  Camera, 
  FileText, 
  Calendar, 
  Target,
  Trophy,
  Sparkles
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  isNext?: boolean;
  onClick?: () => void;
}

interface SetupChecklistProps {
  completedSteps: number;
  totalSteps: number;
  sessionsBooked: number;
  photosUploaded: number;
  formsCompleted: number;
  totalForms: number;
  onMilestoneClick?: (milestoneId: string) => void;
}

export const SetupChecklist = ({
  completedSteps,
  totalSteps,
  sessionsBooked,
  photosUploaded,
  formsCompleted,
  totalForms,
  onMilestoneClick
}: SetupChecklistProps) => {
  // Define milestones based on actual progress
  const profileComplete = completedSteps > 0;
  const formsStarted = formsCompleted > 0;
  const allFormsComplete = formsCompleted === totalForms && totalForms > 0;
  const hasPhotosUploaded = photosUploaded > 0;
  const sessionBooked = sessionsBooked > 0;
  const setupComplete = completedSteps === totalSteps;

  const milestones: Milestone[] = [
    {
      id: 'profile',
      title: 'Profile Setup',
      description: 'Complete your basic information',
      icon: User,
      completed: profileComplete
    },
    {
      id: 'forms',
      title: 'Initial Forms',
      description: `Complete ${totalForms} onboarding forms`,
      icon: FileText,
      completed: allFormsComplete,
      isNext: profileComplete && !allFormsComplete
    },
    {
      id: 'photos',
      title: 'Progress Photos',
      description: 'Upload your baseline photos',
      icon: Camera,
      completed: hasPhotosUploaded,
      isNext: allFormsComplete && !hasPhotosUploaded
    },
    {
      id: 'session',
      title: 'First Session',
      description: 'Schedule your kickoff session',
      icon: Calendar,
      completed: sessionBooked,
      isNext: hasPhotosUploaded && !sessionBooked
    },
    {
      id: 'complete',
      title: 'Setup Complete',
      description: 'Ready to start your journey!',
      icon: Trophy,
      completed: setupComplete,
      isNext: sessionBooked && !setupComplete
    }
  ];

  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);

  return (
    <Card className="bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-success-600" />
            Setup Progress
          </CardTitle>
          <Badge 
            variant="secondary" 
            className="bg-success-100 text-success-700 border-success-300"
          >
            {completedMilestones}/{totalMilestones} Complete
          </Badge>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-2">
          <div className="flex items-center gap-1 mb-2">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`h-2 flex-1 rounded-full transition-all ${
                  milestone.completed 
                    ? 'bg-success-500' 
                    : milestone.isNext 
                      ? 'bg-accent-300' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {progressPercentage}% complete • Next milestone coming up!
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {milestones.map((milestone) => {
          const Icon = milestone.icon;
          
          return (
            <div
              key={milestone.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                milestone.completed
                  ? 'bg-success-50 border border-success-200'
                  : milestone.isNext
                    ? 'bg-accent-50 border border-accent-300 ring-1 ring-accent-300'
                    : 'bg-muted/30 border border-muted'
              } ${milestone.isNext ? 'hover:shadow-sm' : ''}`}
              onClick={() => milestone.isNext && onMilestoneClick?.(milestone.id)}
            >
              <div className={`p-2 rounded-full ${
                milestone.completed
                  ? 'bg-success-100'
                  : milestone.isNext
                    ? 'bg-accent-100'
                    : 'bg-muted'
              }`}>
                {milestone.completed ? (
                  <CheckCircle className="h-4 w-4 text-success-600" />
                ) : milestone.isNext ? (
                  <Sparkles className="h-4 w-4 text-accent-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${
                    milestone.completed 
                      ? 'text-success-600' 
                      : milestone.isNext 
                        ? 'text-accent-600' 
                        : 'text-muted-foreground'
                  }`} />
                  <h4 className={`font-medium ${
                    milestone.completed 
                      ? 'text-success-700' 
                      : milestone.isNext 
                        ? 'text-accent-700' 
                        : 'text-muted-foreground'
                  }`}>
                    {milestone.title}
                  </h4>
                  {milestone.completed && (
                    <Badge variant="outline" className="text-xs bg-success-50 text-success-700 border-success-300">
                      Done
                    </Badge>
                  )}
                  {milestone.isNext && (
                    <Badge variant="outline" className="text-xs bg-accent-50 text-accent-700 border-accent-300">
                      Next
                    </Badge>
                  )}
                </div>
                <p className={`text-sm ${
                  milestone.completed 
                    ? 'text-success-600' 
                    : milestone.isNext 
                      ? 'text-accent-600' 
                      : 'text-muted-foreground'
                }`}>
                  {milestone.description}
                </p>
              </div>

              {milestone.isNext && (
                <Button size="sm" variant="outline" className="text-xs">
                  Start
                </Button>
              )}
            </div>
          );
        })}

        {/* Celebration message when complete */}
        {setupComplete && (
          <div className="mt-4 p-4 bg-gradient-to-r from-success-50 to-primary-50 rounded-lg border border-success-200 text-center">
            <Trophy className="h-8 w-8 text-success-600 mx-auto mb-2" />
            <h3 className="font-semibold text-success-700">Congratulations!</h3>
            <p className="text-sm text-success-600">
              Your setup is complete. Ready to start your fitness journey!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};