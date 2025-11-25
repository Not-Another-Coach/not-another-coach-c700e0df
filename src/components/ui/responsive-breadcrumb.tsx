import React, { useState } from 'react';
import { Check, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveBreadcrumbProps {
  children: React.ReactNode;
  className?: string;
  currentStep?: number;
  currentStepTitle?: string;
  currentStepCompletion?: 'completed' | 'partial' | 'not_started';
  totalSteps?: number;
  completedSteps?: number;
}

export const ResponsiveBreadcrumb: React.FC<ResponsiveBreadcrumbProps> = ({
  children,
  className,
  currentStep,
  currentStepTitle,
  currentStepCompletion,
  totalSteps,
  completedSteps,
}) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Helper to get status icon
  const getStatusIcon = (completion?: 'completed' | 'partial' | 'not_started') => {
    if (completion === 'completed') {
      return <Check className="w-4 h-4 text-green-600" />;
    } else if (completion === 'partial') {
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
    return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
  };

  // Mobile: Show dropdown
  if (isMobile) {
    return (
      <div className={cn("w-full", className)}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                {getStatusIcon(currentStepCompletion)}
                <span className="font-medium text-sm">{currentStepTitle || `Step ${currentStep}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {completedSteps}/{totalSteps}
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[calc(100vw-2rem)] max-h-[60vh] overflow-y-auto p-2" 
            align="start"
            side="bottom"
          >
            <div className="flex flex-col gap-1">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, { ...child.props, variant: 'vertical' } as any);
                }
                return child;
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Desktop: Show horizontal wrapped layout
  return (
    <div 
      className={cn("w-full overflow-x-auto scrollbar-hide", className)}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex gap-1 md:gap-2 lg:gap-3 min-w-max md:flex-wrap md:justify-center px-2 pb-2">
        {children}
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
  variant?: 'horizontal' | 'vertical';
}

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  stepNumber,
  title,
  completion,
  isCurrent,
  onClick,
  variant = 'horizontal'
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

  // Vertical variant for mobile dropdown
  if (variant === 'vertical') {
    return (
      <div
        data-step={stepNumber}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
          isCurrent ? "bg-primary/10" : "hover:bg-muted/50"
        )}
      >
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-medium flex-shrink-0 ${borderColor} ${bgColor} ${statusColor}`}>
          {showIcon ? (
            isPartial ? (
              <AlertCircle className="w-3.5 h-3.5 text-white" />
            ) : (
              <Check className="w-3.5 h-3.5 text-white" />
            )
          ) : (
            stepNumber
          )}
        </div>
        <span className={cn("text-sm font-medium flex-1", statusColor)}>
          {title}
        </span>
        {isCurrent && (
          <span className="text-xs text-primary font-medium">Current</span>
        )}
      </div>
    );
  }

  // Horizontal variant for desktop
  return (
    <div
      data-step={stepNumber}
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 md:gap-1 cursor-pointer hover:opacity-80 transition-opacity p-1.5 md:p-2 rounded-lg hover:bg-muted/50 min-w-fit"
    >
      <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center text-xs font-medium ${borderColor} ${bgColor} ${statusColor}`}>
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
      <div className={`text-[10px] md:text-xs leading-tight text-center whitespace-nowrap ${statusColor}`}>
        {title}
      </div>
    </div>
  );
};