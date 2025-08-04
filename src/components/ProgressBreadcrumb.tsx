import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, ArrowRight, Target, Sparkles, AlertCircle } from 'lucide-react';
import { JourneyProgress } from '@/hooks/useJourneyProgress';
import { StepCompletionIcon } from '@/components/StepCompletionIcon';
import { cn } from '@/lib/utils';

interface ProgressBreadcrumbProps {
  progress: JourneyProgress;
  variant?: 'compact' | 'detailed' | 'minimal';
  showNextAction?: boolean;
  className?: string;
}

export const ProgressBreadcrumb = ({ 
  progress, 
  variant = 'compact', 
  showNextAction = true,
  className 
}: ProgressBreadcrumbProps) => {
  
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-3 text-sm", className)}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            progress.percentage === 100 ? "bg-green-500" : "bg-primary animate-pulse"
          )} />
          <span className="font-medium">
            {progress.currentStep}/{progress.totalSteps} steps
          </span>
        </div>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">
          {progress.percentage}% to your perfect match
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn("bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">Your Fitness Journey</h3>
              <Badge variant="secondary" className="text-xs">
                {progress.currentStep}/{progress.totalSteps}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{progress.percentage}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
          
          <Progress value={progress.percentage} className="h-2 mb-2" />
          
          {showNextAction && progress.nextAction && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowRight className="h-3 w-3" />
              <span>{progress.nextAction}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Detailed variant
  return (
    <Card className={cn("bg-gradient-to-br from-primary/5 via-secondary/5 to-success/5 border-primary/20", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-full">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Your Fitness Journey</h3>
              <p className="text-sm text-muted-foreground">
                Step {progress.currentStep} of {progress.totalSteps} • {progress.percentage}% complete
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {progress.percentage}%
            </div>
            <div className="text-xs text-muted-foreground">to your perfect match</div>
          </div>
        </div>

        <Progress value={progress.percentage} className="h-3 mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          {progress.steps.map((step, index) => {
            // Check if step is partially completed
            const isPartial = step.metadata?.isPartial || false;
            
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg transition-colors",
                  step.completed 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : isPartial
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : step.current 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "bg-muted/50 text-muted-foreground"
                )}
              >
                <StepCompletionIcon 
                  isCompleted={step.completed}
                  isPartial={isPartial}
                  className={cn(
                    step.current && !step.completed && !isPartial ? "text-primary" : ""
                  )}
                />
                <span className={cn(
                  "text-sm font-medium",
                  step.current ? "font-bold" : ""
                )}>{step.title}</span>
                {step.current && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showNextAction && progress.nextAction && (
          <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg border border-primary/10">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Next: {progress.nextAction}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};