import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface OnboardingWelcomeBannerProps {
  clientName: string;
  trainerName: string;
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  nextAction: string;
  onNextActionClick: () => void;
}

export const OnboardingWelcomeBanner = ({
  clientName,
  trainerName,
  currentStep,
  totalSteps,
  completionPercentage,
  nextAction,
  onNextActionClick
}: OnboardingWelcomeBannerProps) => {
  return (
    <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome, {clientName}!
            </h1>
            <p className="text-muted-foreground">
              You're on step {currentStep} of {totalSteps} in your onboarding with {trainerName}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">{completionPercentage}% complete</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Next up: {nextAction}
            </div>
            <Button onClick={onNextActionClick} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {nextAction}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};