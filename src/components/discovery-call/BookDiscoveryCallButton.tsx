import React, { useState } from 'react';
import { Calendar, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiscoveryCallBookingModal } from './DiscoveryCallBookingModal';
import { ManageDiscoveryCallModal } from './ManageDiscoveryCallModal';
import { useDiscoveryCallData } from '@/hooks/useDiscoveryCallData';

interface BookDiscoveryCallButtonProps {
  trainer: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    profilePhotoUrl?: string;
    offers_discovery_call?: boolean | null;
  };
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCallBooked?: () => void;
}

export const BookDiscoveryCallButton = ({ 
  trainer, 
  variant = 'default',
  size = 'md',
  className = '',
  onCallBooked
}: BookDiscoveryCallButtonProps) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const { getDiscoveryCallForTrainer, refresh, loading: callsLoading } = useDiscoveryCallData();

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  // Don't render if trainer doesn't offer discovery calls
  if (!trainer.offers_discovery_call) {
    return null;
  }

  // Wait for loading to complete before checking for active calls
  if (callsLoading) {
    return (
      <Button
        variant={variant}
        disabled
        className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
      >
        <Calendar className="w-4 h-4" />
        Loading...
      </Button>
    );
  }

  // Check if there's an active discovery call with this trainer
  const activeCall = getDiscoveryCallForTrainer(trainer.id);
  const hasActiveCall = !!activeCall;

  const handleCallUpdated = () => {
    refresh();
    onCallBooked?.();
  };

  return (
    <>
      {hasActiveCall ? (
        <Button
          variant={variant}
          onClick={() => setIsManageModalOpen(true)}
          className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
        >
          <Settings className="w-4 h-4" />
          Manage Call
        </Button>
      ) : (
        <Button
          variant={variant}
          onClick={() => setIsBookingModalOpen(true)}
          className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
        >
          <Calendar className="w-4 h-4" />
          Book Discovery Call
        </Button>
      )}

      <DiscoveryCallBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        trainer={trainer}
        onCallBooked={() => {
          setIsBookingModalOpen(false);
          handleCallUpdated();
        }}
      />

      {hasActiveCall && (
        <ManageDiscoveryCallModal
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          discoveryCall={activeCall}
          trainer={trainer}
          onCallUpdated={() => {
            setIsManageModalOpen(false);
            handleCallUpdated();
          }}
        />
      )}
    </>
  );
};