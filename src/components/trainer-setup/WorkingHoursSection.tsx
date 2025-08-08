import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';
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
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(formData.availability_slots || []);
  const [newSlot, setNewSlot] = useState({
    day: "",
    startTime: "07:00",
    endTime: "08:00"
  });
  const [isUKBased, setIsUKBased] = useState(formData.is_uk_based ?? true);
  
  // Initialize availability state
  const [availability, setAvailability] = useState<Record<string, TimeSlot[]>>({});

  // Initialize availability from existing data
  useEffect(() => {
    if (formData.availability_slots) {
      const grouped = formData.availability_slots.reduce((acc: Record<string, TimeSlot[]>, slot: any) => {
        if (!acc[slot.day]) {
          acc[slot.day] = [];
        }
        acc[slot.day].push({
          id: slot.id || `${slot.day}-${slot.startTime}-${slot.endTime}`,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
        return acc;
      }, {});
      setAvailability(grouped);
    }
  }, [formData.availability_slots]);

  const updateDayAvailability = (day: string, slots: TimeSlot[]) => {
    const newAvailability = { ...availability, [day]: slots };
    setAvailability(newAvailability);
    
    // Flatten for form data
    const flatSlots = Object.entries(newAvailability).flatMap(([dayKey, daySlots]) => 
      daySlots.map(slot => ({
        ...slot
      }))
    );
    
    updateFormData({ availability_slots: flatSlots });
  };

  const addTimeSlot = (day: string) => {
    const newSlot: TimeSlot = {
      id: `${day}-${Date.now()}`,
      day,
      startTime: "07:00",
      endTime: "08:00"
    };
    
    const currentSlots = availability[day] || [];
    updateDayAvailability(day, [...currentSlots, newSlot]);
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
    updateDayAvailability(day, newSlots);
  };

  const handleUKBasedChange = (value: string) => {
    const ukBased = value === 'yes';
    setIsUKBased(ukBased);
    updateFormData({ is_uk_based: ukBased });
  };

  const setQuickSchedule = (type: 'weekdays' | 'weekends' | 'clear') => {
    const newAvailability: Record<string, TimeSlot[]> = {};

    if (type === 'clear') {
      daysOfWeek.forEach(day => {
        newAvailability[day] = [];
      });
    } else if (type === 'weekdays') {
      const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      weekdays.forEach(day => {
        newAvailability[day] = [{
          id: `${day}-default`,
          day,
          startTime: '09:00',
          endTime: '17:00'
        }];
      });
      // Keep weekends empty
      ['saturday', 'sunday'].forEach(day => {
        newAvailability[day] = availability[day] || [];
      });
    } else if (type === 'weekends') {
      const weekends = ['saturday', 'sunday'];
      weekends.forEach(day => {
        newAvailability[day] = [{
          id: `${day}-default`,
          day,
          startTime: '10:00',
          endTime: '16:00'
        }];
      });
      // Keep weekdays as they are
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        newAvailability[day] = availability[day] || [];
      });
    }

    setAvailability(newAvailability);
    
    // Flatten for form data
    const flatSlots = Object.entries(newAvailability).flatMap(([dayKey, daySlots]) => 
      daySlots.map(slot => ({
        ...slot
      }))
    );
    updateFormData({ availability_slots: flatSlots });
  };

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
            >
              Weekdays (9AM-5PM)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('weekends')}
            >
              Weekends (10AM-4PM)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('clear')}
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
                      <h4 className="font-medium">{dayName}</h4>
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
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
