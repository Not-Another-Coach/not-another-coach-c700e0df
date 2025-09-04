import React from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const VerificationBadge = ({ 
  isVerified = false, 
  size = 'md', 
  className,
  showIcon = true 
}: VerificationBadgeProps) => {
  if (!isVerified) return null;

  const sizeConfig = {
    sm: {
      badge: 'text-xs px-2 py-1',
      icon: 'h-3 w-3',
    },
    md: {
      badge: 'text-sm px-3 py-1',
      icon: 'h-4 w-4',
    },
    lg: {
      badge: 'text-base px-4 py-2',
      icon: 'h-5 w-5',
    },
  };

  return (
    <Badge 
      className={cn(
        'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
        'font-medium inline-flex items-center gap-1',
        sizeConfig[size].badge,
        className
      )}
    >
      {showIcon && <CheckCircle2 className={sizeConfig[size].icon} />}
      Verified Coach
    </Badge>
  );
};