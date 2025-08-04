import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Sparkles, Target } from 'lucide-react';
import { ClientJourneyProgress } from '@/hooks/useClientJourneyProgress';
import { cn } from '@/lib/utils';

interface ClientJourneyBreadcrumbProps {
  progress: ClientJourneyProgress;
  variant?: 'compact' | 'detailed';
  showNextAction?: boolean;
  className?: string;
}

export const ClientJourneyBreadcrumb = ({ 
  progress, 
  variant = 'compact', 
  showNextAction = true,
  className 
}: ClientJourneyBreadcrumbProps) => {
  
  if (variant === 'compact') {
    return (
      <Card className={cn("bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">Your Fitness Journey</h3>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{progress.percentage}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
          
          <Progress value={progress.percentage} className="h-2 mb-3" />
          
          {/* Breadcrumb Steps */}
          <div className="flex items-center gap-1 mb-2 overflow-x-auto">
            <TooltipProvider>
              {progress.steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap relative",
                        step.completed 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : step.current
                          ? step.hasData 
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : "bg-primary/10 text-primary border border-primary/20 animate-pulse"
                          : "bg-muted/50 text-muted-foreground"
                       )}>
                         <span className="text-sm">{step.icon}</span>
                         <span className={cn(
                           "hidden sm:inline",
                           step.current ? "font-bold" : ""
                         )}>{step.title}</span>
                         {step.current && (
                           <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                         )}
                       </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {index < progress.steps.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </TooltipProvider>
          </div>
          
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
    <Card className={cn("bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-full">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Your Fitness Journey</h3>
              <p className="text-sm text-muted-foreground">
                Stage {progress.currentStageIndex + 1} of {progress.totalStages} • {progress.percentage}% complete
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {progress.percentage}%
            </div>
            <div className="text-xs text-muted-foreground">to your coach</div>
          </div>
        </div>

        <Progress value={progress.percentage} className="h-3 mb-4" />

        {/* Detailed Breadcrumb Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <TooltipProvider>
            {progress.steps.map((step, index) => (
              <Tooltip key={step.id}>
                <TooltipTrigger asChild>
                   <div className={cn(
                     "flex items-center gap-3 p-3 rounded-lg transition-all cursor-help border relative",
                     step.completed 
                       ? "bg-green-50 text-green-800 border-green-200 shadow-sm" 
                       : step.current
                       ? step.hasData
                         ? "bg-orange-50 text-orange-800 border-orange-200 shadow-md"
                         : "bg-primary/10 text-primary border-primary/20 shadow-md animate-pulse"
                       : "bg-muted/50 text-muted-foreground border-muted"
                   )}>
                     <div className={cn(
                       "text-lg flex-shrink-0",
                       step.completed && "animate-bounce"
                     )}>
                       {step.icon}
                     </div>
                     <div className="min-w-0">
                       <div className={cn(
                         "font-medium text-sm truncate",
                         step.current ? "font-bold" : ""
                       )}>{step.title}</div>
                       <div className="text-xs opacity-75">{step.description}</div>
                     </div>
                     {step.current && (
                       <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                     )}
                   </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground max-w-48">{step.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {showNextAction && progress.nextAction && (
          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-primary/10">
            <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium">{progress.nextAction}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};