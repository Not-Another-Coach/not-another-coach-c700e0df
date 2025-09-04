import React from 'react';
import { VerificationStatusIndicator } from '@/components/ui/verification-status-indicator';

interface VerificationBadgeIntegrationProps {
  trainer: {
    id: string;
    verification_status?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerificationBadgeIntegration: React.FC<VerificationBadgeIntegrationProps> = ({
  trainer,
  size = 'sm',
  className
}) => {
  if (!trainer.verification_status || trainer.verification_status === 'not_verified') {
    return null;
  }

  return (
    <VerificationStatusIndicator
      status={trainer.verification_status}
      size={size}
      className={className}
    />
  );
};