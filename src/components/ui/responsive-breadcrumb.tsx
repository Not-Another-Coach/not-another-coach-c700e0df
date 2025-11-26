import React from 'react';
import { Check, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StepData {
  stepNumber: number;
  title: string;
  completion: 'completed' | 'partial' | 'not_started';
}

interface ResponsiveBreadcrumbProps {
  children: React.ReactNode;
  className?: string;
  currentStep?: number;
  steps?: StepData[];
  onStepChange?: (step: number) => void;
  totalSteps?: number;
  overallProgress?: number;
}

export const ResponsiveBreadcrumb: React.FC<ResponsiveBreadcrumbProps> = ({
  children,
  className,
  currentStep,
  steps,
  onStepChange,
  totalSteps,
  overallProgress,
}) => {
  const getCurrentStepInfo = () => {
    if (!currentStep || !steps) return null;
    return steps.find(s => s.stepNumber === currentStep);
  };

  const currentStepInfo = getCurrentStepInfo();
  const completedSteps = steps?.filter(s => s.completion === 'completed').length || 0;

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Dropdown */}
      {currentStep && steps && onStepChange ? (
        <div className="sm:hidden w-full pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between gap-2 p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-primary bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                    {currentStep}
                  </div>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium text-foreground truncate w-full">
                      {currentStepInfo?.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Step {currentStep} of {totalSteps} • {overallProgress}% Complete
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-[calc(100vw-2rem)] max-h-[60vh] overflow-y-auto bg-popover border border-border z-50"
            >
              {steps.map((step) => {
                const isCurrent = step.stepNumber === currentStep;
                let statusIcon = null;
                let statusColor = 'text-muted-foreground';
                let bgColor = 'bg-background';
                
                if (step.completion === 'completed') {
                  statusIcon = <Check className="w-3 h-3 text-white" />;
                  statusColor = 'text-green-600';
                  bgColor = 'bg-green-600';
                } else if (step.completion === 'partial') {
                  statusIcon = <AlertCircle className="w-3 h-3 text-white" />;
                  statusColor = 'text-amber-600';
                  bgColor = 'bg-amber-600';
                }

                return (
                  <DropdownMenuItem
                    key={step.stepNumber}
                    onClick={() => onStepChange(step.stepNumber)}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer",
                      isCurrent && "bg-accent"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                      step.completion === 'completed' ? 'border-green-600' : 
                      step.completion === 'partial' ? 'border-amber-600' : 'border-muted-foreground/30',
                      bgColor,
                      statusColor
                    )}>
                      {statusIcon || step.stepNumber}
                    </div>
                    <span className={cn(
                      "text-sm flex-1",
                      isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      {/* Desktop Horizontal Layout */}
      <div 
        className="hidden sm:block w-full overflow-visible"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex gap-1 sm:gap-2 lg:gap-3 flex-wrap justify-center px-2 pb-2">
          {children}
        </div>
      </div>
    </div>
  );
};

interface BreadcrumbItemProps {
  stepNumber: number;
  title: string;
  completion: 'completed' | 'partial' | 'not_started';
  isCurrent: boolean;
  onClick: () => void;
}

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  stepNumber,
  title,
  completion,
  isCurrent,
  onClick,
}) => {
  let statusColor = 'text-muted-foreground';
  let borderColor = 'border-muted-foreground/30';
  let bgColor = 'bg-background';
  let showIcon = false;
  let isPartial = false;

  if (completion === 'completed') {
    statusColor = 'text-green-600';
    borderColor = 'border-green-600';
    bgColor = 'bg-green-600';
    showIcon = true;
  } else if (completion === 'partial') {
    statusColor = 'text-amber-600';
    borderColor = 'border-amber-600';
    bgColor = 'bg-amber-600';
    showIcon = true;
    isPartial = true;
  } else if (isCurrent) {
    statusColor = 'text-primary';
    borderColor = 'border-primary';
  }

  return (
    <div
      data-step={stepNumber}
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 md:gap-1 cursor-pointer hover:opacity-80 transition-opacity p-1.5 md:p-2 rounded-lg hover:bg-muted/50"
    >
      <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center text-xs font-medium flex-shrink-0 ${borderColor} ${bgColor} ${statusColor}`}>
        {showIcon ? (
          isPartial ? (
            <AlertCircle className="w-3 h-3 text-white" />
          ) : (
            <Check className="w-3 h-3 text-white" />
          )
        ) : (
          stepNumber
        )}
      </div>
      <div className={`text-[10px] md:text-xs leading-tight text-center max-w-[80px] md:max-w-[100px] break-words ${statusColor}`}>
        {title}
      </div>
    </div>
  );
};