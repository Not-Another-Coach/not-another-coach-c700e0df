import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, MessageCircle, Calendar, ArrowRight, Clock, Upload, FileText, Link as LinkIcon, Circle } from 'lucide-react';

interface OnboardingStep {
  id: string;
  activity_name: string;
  activity_type: 'task' | 'appointment' | 'survey' | 'training_content' | 'file_upload';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  due_at?: string;
  description?: string;
}

interface OnboardingHeroCardProps {
  clientName: string;
  trainerName: string;
  trainerPhoto?: string | null;
  trainerTagline?: string;
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  nextAction: string;
  templateName?: string;
  steps: OnboardingStep[];
  onNextActionClick: () => void;
  onMessage: () => void;
  onBookSession: () => void;
  onStepClick: (step: OnboardingStep) => void;
}

export const OnboardingHeroCard = ({
  clientName,
  trainerName,
  trainerPhoto,
  trainerTagline = "Your Personal Trainer",
  currentStep,
  totalSteps,
  completionPercentage,
  nextAction,
  templateName,
  steps,
  onNextActionClick,
  onMessage,
  onBookSession,
  onStepClick
}: OnboardingHeroCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getProgressMessage = () => {
    if (completionPercentage === 0) return "Let's get started on your journey";
    if (completionPercentage < 30) return "Great start! Building momentum";
    if (completionPercentage < 70) return "Making excellent progress";
    if (completionPercentage < 100) return "Almost there! Final steps ahead";
    return "Congratulations! Setup complete";
  };

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

  const currentIndex = steps.findIndex(step => step.status === 'in_progress' || step.status === 'pending');
  const activeIndex = currentIndex >= 0 ? currentIndex : steps.length - 1;

  return (
    <Card className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 border-primary-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Welcome back, {clientName}!
                </h1>
                <p className="text-primary-100 text-sm">
                  {getProgressMessage()}
                </p>
              </div>
              
              {/* Trainer Avatar */}
              <div className="flex flex-col items-center">
                <Avatar className="h-12 w-12 border-2 border-white/30 mb-1">
                  <AvatarImage src={trainerPhoto || undefined} alt={trainerName} />
                  <AvatarFallback className="bg-white/20 text-white font-semibold">
                    {getInitials(trainerName)}
                  </AvatarFallback>
                </Avatar>
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                  <Star className="h-3 w-3 mr-1" />
                  Trainer
                </Badge>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{trainerName}</span>
                  <span className="text-primary-200">•</span>
                  <span className="text-primary-200">Step {currentStep} of {totalSteps}</span>
                </div>
                <span className="font-bold">{completionPercentage}%</span>
              </div>
              <Progress 
                value={completionPercentage} 
                className="h-2 bg-white/20"
              />
              {templateName && (
                <p className="text-xs text-primary-200 mt-1">
                  Following: {templateName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            {/* Next Action */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">Next up:</p>
              <p className="font-medium text-foreground mb-3 truncate pr-4">
                {nextAction}
              </p>
              <Button 
                onClick={onNextActionClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                Continue Onboarding
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <Button 
                onClick={onMessage}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 text-xs"
              >
                <MessageCircle className="h-3 w-3" />
                Message
              </Button>
              <Button 
                onClick={onBookSession}
                variant="outline"
                size="sm" 
                className="flex items-center gap-2 text-xs"
              >
                <Calendar className="h-3 w-3" />
                Book Call
              </Button>
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="mt-6 pt-6 border-t border-muted/50">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-foreground">Your Progress</h3>
            </div>
            
            {/* Desktop horizontal stepper */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between">
                {steps.slice(0, 5).map((step, index) => {
                  const StatusIcon = getStatusIcon(step.status);
                  const ActivityIcon = getActivityIcon(step.activity_type);
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1">
                      <div 
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${getStepColor(step.status, index, activeIndex)}`}
                        onClick={() => onStepClick(step)}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-success-600" />
                        ) : (
                          <ActivityIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-center mt-2 max-w-16">
                        <p className="text-xs font-medium text-foreground truncate">
                          {step.activity_name}
                        </p>
                        <Badge variant="outline" className={`text-xs mt-1 ${getStatusColor(step.status)}`}>
                          {step.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {index < Math.min(steps.length - 1, 4) && (
                        <div className="w-full h-0.5 bg-muted absolute mt-5 ml-5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile vertical list */}
            <div className="md:hidden space-y-2">
              {steps.slice(0, 3).map((step, index) => {
                const StatusIcon = getStatusIcon(step.status);
                const ActivityIcon = getActivityIcon(step.activity_type);
                
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${getStepColor(step.status, index, activeIndex)}`}
                    onClick={() => onStepClick(step)}
                  >
                    <div className="flex-shrink-0">
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-success-600" />
                      ) : (
                        <ActivityIcon className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{step.activity_name}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(step.status)}`}>
                      {step.status.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {steps.length > 5 && (
              <div className="text-center pt-3">
                <p className="text-xs text-muted-foreground">
                  +{steps.length - 5} more steps to complete
                </p>
              </div>
            )}
          </div>

          {/* Trainer Info */}
          <div className="mt-4 pt-4 border-t border-muted/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={trainerPhoto || undefined} alt={trainerName} />
                <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                  {getInitials(trainerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm text-foreground">{trainerName}</p>
                <p className="text-xs text-muted-foreground">{trainerTagline}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};