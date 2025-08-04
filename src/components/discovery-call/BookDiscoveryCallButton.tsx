import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiscoveryCallBookingModal } from './DiscoveryCallBookingModal';

interface BookDiscoveryCallButtonProps {
  trainer: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    profilePhotoUrl?: string;
  };
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BookDiscoveryCallButton = ({ 
  trainer, 
  variant = 'default',
  size = 'md',
  className = ''
}: BookDiscoveryCallButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
      >
        <Calendar className="w-4 h-4" />
        Book Discovery Call
      </Button>

      <DiscoveryCallBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trainer={trainer}
      />
    </>
  );
};