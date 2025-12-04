import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';
import { WorkingHoursSection } from './WorkingHoursSection';
import { AvailabilitySection } from './AvailabilitySection';
import { SectionHeader } from './SectionHeader';

interface WorkingHoursAndAvailabilitySectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  onAvailabilityChange?: (status: string, settings: any) => void;
  onScheduleChange?: (schedule: any) => void;
}

export function WorkingHoursAndAvailabilitySection({ formData, updateFormData, onAvailabilityChange, onScheduleChange }: WorkingHoursAndAvailabilitySectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Clock, Users]}
        title="Working Hours & New Client Availability"
        description="Set your weekly schedule and manage when you're accepting new clients"
      />

      {/* Working Hours */}
      <WorkingHoursSection 
        formData={formData} 
        updateFormData={updateFormData} 
        onScheduleChange={onScheduleChange}
      />
      
      {/* New Client Availability Status */}
      <AvailabilitySection 
        formData={formData} 
        updateFormData={updateFormData} 
        onAvailabilityChange={onAvailabilityChange}
      />
    </div>
  );
}