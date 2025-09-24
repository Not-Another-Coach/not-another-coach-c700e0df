import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, MessageCircle, Calendar, ArrowRight } from 'lucide-react';

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
  onNextActionClick: () => void;
  onMessage: () => void;
  onBookSession: () => void;
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
  onNextActionClick,
  onMessage,
  onBookSession
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