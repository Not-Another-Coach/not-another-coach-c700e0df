import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';
import { WorkingHoursSection } from './WorkingHoursSection';
import { AvailabilitySection } from './AvailabilitySection';

interface WorkingHoursAndAvailabilitySectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  onAvailabilityChange?: (status: string, settings: any) => void;
}

export function WorkingHoursAndAvailabilitySection({ formData, updateFormData, onAvailabilityChange }: WorkingHoursAndAvailabilitySectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Clock className="w-6 h-6" />
          <Users className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">Working Hours & New Client Availability</h2>
        <p className="text-muted-foreground">
          Set your weekly schedule and manage when you're accepting new clients
        </p>
      </div>

      {/* Working Hours */}
      <WorkingHoursSection formData={formData} updateFormData={updateFormData} />
      
      {/* New Client Availability Status */}
      <AvailabilitySection 
        formData={formData} 
        updateFormData={updateFormData} 
        onAvailabilityChange={onAvailabilityChange}
      />
    </div>
  );
}