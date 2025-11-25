import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveBreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveBreadcrumb: React.FC<ResponsiveBreadcrumbProps> = ({
  children,
  className,
}) => {
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