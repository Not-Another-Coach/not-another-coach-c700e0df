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
                  {templateName} • {getProgressMessage()}
                </p>
              </div>
              
              {/* Trainer Avatar with Message Icon */}
              <div className="flex flex-col items-center relative">
                <Avatar className="h-12 w-12 border-2 border-white/30 mb-1">
                  <AvatarImage src={trainerPhoto || undefined} alt={trainerName} />
                  <AvatarFallback className="bg-white/20 text-white font-semibold">
                    {getInitials(trainerName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={onMessage}
                  size="icon"
                  variant="outline"
                  className="absolute -top-1 -right-1 h-6 w-6 bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full"
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                  <Star className="h-3 w-3 mr-1" />
                  {trainerName}
                </Badge>
              </div>
            </div>

            {/* Progress Section with Visual Stepper */}
            <div className="space-y-4">
              {/* Visual Progress Stepper */}
              <div className="space-y-3">
                
                {/* Desktop horizontal stepper */}
                <div className="hidden md:block">
                  <div className="flex items-center justify-between">
                    {steps.slice(0, 5).map((step, index) => {
                      const StatusIcon = getStatusIcon(step.status);
                      const ActivityIcon = getActivityIcon(step.activity_type);
                      const isActive = index === currentStep - 1;
                      
                      return (
                        <div key={step.id} className="flex flex-col items-center flex-1 relative">
                          <div 
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                              step.status === 'completed' 
                                ? 'bg-white/20 border-white text-white' 
                                : isActive 
                                  ? 'bg-white border-white text-primary-600' 
                                  : 'bg-white/10 border-white/30 text-white/60'
                            }`}
                            onClick={() => onStepClick(step)}
                          >
                            {step.status === 'completed' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <ActivityIcon className="h-3 w-3" />
                            )}
                          </div>
                          <div className="text-center mt-1 max-w-24">
                            <p className={`text-xs font-medium ${
                              isActive ? 'text-white' : 'text-white/70'
                            }`} style={{ lineHeight: '1.2', wordWrap: 'break-word' }}>
                              {step.activity_name}
                            </p>
                          </div>
                          {index < Math.min(steps.length - 1, 4) && (
                            <div className={`absolute top-4 left-1/2 w-1/2 h-0.5 ${
                              step.status === 'completed' ? 'bg-white/40' : 'bg-white/20'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile compact stepper */}
                <div className="md:hidden flex items-center justify-center space-x-2">
                  {steps.slice(0, 5).map((step, index) => {
                    const isActive = index === currentStep - 1;
                    return (
                      <div
                        key={step.id}
                        className={`w-2 h-2 rounded-full transition-all ${
                          step.status === 'completed'
                            ? 'bg-white'
                            : isActive
                              ? 'bg-white/80 scale-125'
                              : 'bg-white/30'
                        }`}
                      />
                    );
                  })}
                  {steps.length > 5 && (
                    <span className="text-xs text-white/60 ml-2">+{steps.length - 5}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Step Inline CTA */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Next up: <span className="font-medium text-foreground">{nextAction}</span>
              </p>
            </div>
            <Button 
              onClick={onNextActionClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
              size="sm"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};