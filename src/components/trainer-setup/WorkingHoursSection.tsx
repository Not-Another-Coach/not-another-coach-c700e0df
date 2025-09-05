import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { useCoachAvailability } from '@/hooks/useCoachAvailability';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface WorkingHoursSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function WorkingHoursSection({ formData, updateFormData }: WorkingHoursSectionProps) {
  const { settings, loading, saving, updateSettings } = useCoachAvailability();
  const { toast } = useToast();
  const [isUKBased, setIsUKBased] = useState(formData.is_uk_based ?? true);
  
  // Initialize availability state from coach availability settings
  const [availability, setAvailability] = useState<Record<string, TimeSlot[]>>({});

  // Initialize availability from coach availability settings
  useEffect(() => {
    if (settings?.availability_schedule) {
      const grouped: Record<string, TimeSlot[]> = {};
      
      Object.entries(settings.availability_schedule).forEach(([day, daySchedule]) => {
        grouped[day] = daySchedule.slots.map((slot, index) => ({
          id: `${day}-${index}`,
          day,
          startTime: slot.start,
          endTime: slot.end
        }));
      });
      
      setAvailability(grouped);
    }
  }, [settings?.availability_schedule]);

  const updateDayAvailability = async (day: string, slots: TimeSlot[]) => {
    const newAvailability = { ...availability, [day]: slots };
    setAvailability(newAvailability);
    
    // Update coach availability settings
    if (settings) {
      const newSchedule = { ...settings.availability_schedule };
      
      newSchedule[day] = {
        enabled: slots.length > 0,
        slots: slots.map(slot => ({
          start: slot.startTime,
          end: slot.endTime
        }))
      };
      
      await updateSettings({ availability_schedule: newSchedule });
    }
  };


  // Helper function to check if two time slots overlap
  const doSlotsOverlap = (slot1: { startTime: string; endTime: string }, slot2: { startTime: string; endTime: string }) => {
    const start1 = parseTime(slot1.startTime);
    const end1 = parseTime(slot1.endTime);
    const start2 = parseTime(slot2.startTime);
    const end2 = parseTime(slot2.endTime);
    
    return start1 < end2 && start2 < end1;
  };

  // Helper function to parse time string to minutes
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Validate time slots for overlaps
  const validateTimeSlots = (day: string, newSlots: TimeSlot[]) => {
    for (let i = 0; i < newSlots.length; i++) {
      for (let j = i + 1; j < newSlots.length; j++) {
        if (doSlotsOverlap(newSlots[i], newSlots[j])) {
          return false;
        }
      }
    }
    return true;
  };

  const addTimeSlot = (day: string) => {
    const newSlot: TimeSlot = {
      id: `${day}-${Date.now()}`,
      day,
      startTime: "07:00",
      endTime: "08:00"
    };
    
    const currentSlots = availability[day] || [];
    const newSlots = [...currentSlots, newSlot];
    
    // Validate for overlaps
    if (!validateTimeSlots(day, newSlots)) {
      toast({
        title: "Time Slot Conflict",
        description: "This time slot overlaps with an existing slot. Please choose different times.",
        variant: "destructive",
      });
      return;
    }
    
    updateDayAvailability(day, newSlots);
  };

  const removeTimeSlot = (day: string, slotIndex: number) => {
    const currentSlots = availability[day] || [];
    const newSlots = currentSlots.filter((_, index) => index !== slotIndex);
    updateDayAvailability(day, newSlots);
  };

  const updateTimeSlot = (day: string, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const currentSlots = availability[day] || [];
    const newSlots = currentSlots.map((slot, index) => 
      index === slotIndex ? { ...slot, [field]: value } : slot
    );
    
    // Validate for overlaps
    if (!validateTimeSlots(day, newSlots)) {
      toast({
        title: "Time Slot Conflict",
        description: "This time change creates an overlap with another slot. Please choose different times.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate that start time is before end time
    const updatedSlot = newSlots[slotIndex];
    if (parseTime(updatedSlot.startTime) >= parseTime(updatedSlot.endTime)) {
      toast({
        title: "Invalid Time Range",
        description: "Start time must be before end time.",
        variant: "destructive",
      });
      return;
    }
    
    updateDayAvailability(day, newSlots);
  };

  const handleUKBasedChange = (value: string) => {
    const ukBased = value === 'yes';
    setIsUKBased(ukBased);
    updateFormData({ is_uk_based: ukBased });
  };

  const setQuickSchedule = async (type: 'weekdays' | 'weekends' | 'clear') => {
    if (!settings) return;

    const newSchedule = { ...settings.availability_schedule };

    if (type === 'clear') {
      daysOfWeek.forEach(day => {
        newSchedule[day] = { enabled: false, slots: [] };
      });
    } else if (type === 'weekdays') {
      const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      weekdays.forEach(day => {
        newSchedule[day] = {
          enabled: true,
          slots: [{ start: '09:00', end: '17:00' }]
        };
      });
    } else if (type === 'weekends') {
      const weekends = ['saturday', 'sunday'];
      weekends.forEach(day => {
        newSchedule[day] = {
          enabled: true,
          slots: [{ start: '10:00', end: '16:00' }]
        };
      });
    }

    await updateSettings({ availability_schedule: newSchedule });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Working Hours
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set your general availability for training sessions and location preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* UK Based Question */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Are you UK-based?</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={isUKBased ? "default" : "outline"}
              onClick={() => handleUKBasedChange('yes')}
              className="justify-start"
            >
              Yes, I'm UK-based
            </Button>
            <Button
              type="button"
              variant={!isUKBased ? "default" : "outline"}
              onClick={() => handleUKBasedChange('no')}
              className="justify-start"
            >
              No, I'm international
            </Button>
          </div>
        </div>

        {/* Quick Schedule Templates */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('weekdays')}
              disabled={saving}
            >
              Weekdays (9AM-5PM)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('weekends')}
              disabled={saving}
            >
              Weekends (10AM-4PM)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('clear')}
              disabled={saving}
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Weekly Availability Grid */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Weekly Availability</Label>
          <div className="grid gap-4">
            {daysOfWeek.map((day) => {
              const daySlots = availability[day] || [];
              const dayName = day.charAt(0).toUpperCase() + day.slice(1);
              
              return (
                <div key={day} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">
                        {dayName}
                      </h4>
                      {daySlots.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addTimeSlot(day)}
                      disabled={saving}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Slot
                    </Button>
                  </div>
                  
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No availability set for this day
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {daySlots.map((slot, index) => (
                        <div key={slot.id} className="flex items-center gap-2">
                          <Select
                            value={slot.startTime}
                            onValueChange={(value) => updateTimeSlot(day, index, 'startTime', value)}
                            disabled={saving}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-muted-foreground">to</span>
                          <Select
                            value={slot.endTime}
                            onValueChange={(value) => updateTimeSlot(day, index, 'endTime', value)}
                            disabled={saving}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTimeSlot(day, index)}
                            disabled={saving}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bank Holiday Setting - Only show if UK-based */}
        {isUKBased && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">UK Bank Holiday Availability</Label>
                <p className="text-sm text-muted-foreground">
                  Are you available to work on UK bank holidays?
                </p>
              </div>
              <Switch
                checked={formData.works_bank_holidays || false}
                onCheckedChange={(checked) => updateFormData({ works_bank_holidays: checked })}
                disabled={saving}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
