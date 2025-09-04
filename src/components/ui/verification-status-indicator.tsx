import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationStatusIndicatorProps {
  status?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    label: 'Verified',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconColor: 'text-emerald-600'
  },
  pending: {
    icon: Clock,
    label: 'Under Review',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    iconColor: 'text-amber-600'
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  },
  expired: {
    icon: AlertTriangle,
    label: 'Expired',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconColor: 'text-orange-600'
  },
  not_verified: {
    icon: Shield,
    label: 'Not Verified',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconColor: 'text-gray-600'
  }
};

export const VerificationStatusIndicator: React.FC<VerificationStatusIndicatorProps> = ({
  status = 'not_verified',
  size = 'md',
  showIcon = true,
  showText = true,
  className
}) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_verified;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (!showIcon && !showText) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        config.color,
        sizeClasses[size],
        'flex items-center gap-1.5 font-medium border',
        className
      )}
    >
      {showIcon && (
        <IconComponent className={cn(iconSizes[size], config.iconColor)} />
      )}
      {showText && config.label}
    </Badge>
  );
};