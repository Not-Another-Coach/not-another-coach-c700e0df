import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar } from "lucide-react";

interface AvailabilityGridProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const time = `${hour.toString().padStart(2, '0')}:${minute}`;
  return time;
});

export function AvailabilityGrid({ formData, updateFormData }: AvailabilityGridProps) {
  const [availability, setAvailability] = useState<Record<string, TimeSlot[]>>({});
  const [isUKBased, setIsUKBased] = useState(formData.is_uk_based ?? true);

  // Initialize availability from existing data
  useEffect(() => {
    if (formData.availability_slots) {
      const grouped = formData.availability_slots.reduce((acc: Record<string, TimeSlot[]>, slot: any) => {
        if (!acc[slot.day]) {
          acc[slot.day] = [];
        }
        acc[slot.day].push({
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
    
    // Convert to flat array for form data
    const flatSlots = Object.values(newAvailability).flat().map((slot, index) => ({
      id: `${slot.day}-${index}`,
      ...slot
    }));
    
    updateFormData({ availability_slots: flatSlots });
  };

  const addTimeSlot = (day: string) => {
    const daySlots = availability[day] || [];
    const newSlot: TimeSlot = {
      day,
      startTime: "09:00",
      endTime: "17:00"
    };
    updateDayAvailability(day, [...daySlots, newSlot]);
  };

  const removeTimeSlot = (day: string, slotIndex: number) => {
    const daySlots = availability[day] || [];
    const updatedSlots = daySlots.filter((_, index) => index !== slotIndex);
    updateDayAvailability(day, updatedSlots);
  };

  const updateTimeSlot = (day: string, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const daySlots = [...(availability[day] || [])];
    daySlots[slotIndex] = { ...daySlots[slotIndex], [field]: value };
    updateDayAvailability(day, daySlots);
  };

  const handleUKBasedChange = (value: string) => {
    const isUK = value === "yes";
    setIsUKBased(isUK);
    updateFormData({ is_uk_based: isUK });
  };

  const setQuickSchedule = (type: 'weekdays' | 'weekends' | 'clear') => {
    let newAvailability: Record<string, TimeSlot[]> = {};
    
    if (type === 'weekdays') {
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
        newAvailability[day] = [{
          day,
          startTime: "06:00",
          endTime: "18:00"
        }];
      });
    } else if (type === 'weekends') {
      newAvailability = { ...availability };
      newAvailability['Saturday'] = [{
        day: 'Saturday',
        startTime: "08:00",
        endTime: "14:00"
      }];
      newAvailability['Sunday'] = [{
        day: 'Sunday',
        startTime: "10:00",
        endTime: "16:00"
      }];
    } else if (type === 'clear') {
      newAvailability = {};
    }

    setAvailability(newAvailability);
    const flatSlots = Object.values(newAvailability).flat().map((slot, index) => ({
      id: `${slot.day}-${index}`,
      ...slot
    }));
    updateFormData({ availability_slots: flatSlots });
  };

  return (
    <div className="space-y-6">
      {/* UK Based Question */}
      <div className="space-y-2">
        <Label>Are you based in the UK?</Label>
        <Select value={isUKBased ? "yes" : "no"} onValueChange={handleUKBasedChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes, I'm UK-based</SelectItem>
            <SelectItem value="no">No, I'm international</SelectItem>
          </SelectContent>
        </Select>
        {!isUKBased && (
          <p className="text-xs text-orange-600">
            ⚠️ Please ensure all times below are shown in UK time for consistency
          </p>
        )}
      </div>

      {/* Quick Schedule Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('weekdays')}
            >
              Weekdays (6am-6pm)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('weekends')}
            >
              Add Weekends
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('clear')}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Availability Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">{day}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot(day)}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Add Time
                </Button>
              </div>
              
              <div className="space-y-2 pl-4">
                {(availability[day] || []).map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-2">
                    <Select 
                      value={slot.startTime}
                      onValueChange={(value) => updateTimeSlot(day, slotIndex, 'startTime', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <span className="text-muted-foreground">to</span>
                    
                    <Select 
                      value={slot.endTime}
                      onValueChange={(value) => updateTimeSlot(day, slotIndex, 'endTime', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeSlot(day, slotIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                
                {(!availability[day] || availability[day].length === 0) && (
                  <p className="text-sm text-muted-foreground pl-2">Not available</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* UK Bank Holidays */}
      {isUKBased && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">UK Bank Holidays</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="work-bank-holidays"
                  checked={formData.works_bank_holidays || false}
                  onChange={(e) => updateFormData({ works_bank_holidays: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="work-bank-holidays" className="text-sm">
                  I'm available to work on UK bank holidays
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                This helps clients know if you're available during holiday periods
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}