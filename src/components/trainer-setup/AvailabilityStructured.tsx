import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus } from "lucide-react";

interface AvailabilityStructuredProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

interface TimeSlot {
  id: string;
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

export function AvailabilityStructured({ formData, updateFormData }: AvailabilityStructuredProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(formData.availability_slots || []);
  const [newSlot, setNewSlot] = useState({
    day: "",
    startTime: "",
    endTime: ""
  });
  const [isUKBased, setIsUKBased] = useState(formData.is_uk_based ?? true);

  const addTimeSlot = () => {
    if (newSlot.day && newSlot.startTime && newSlot.endTime) {
      const timeSlot: TimeSlot = {
        id: Date.now().toString(),
        day: newSlot.day,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime
      };
      
      const updatedSlots = [...timeSlots, timeSlot];
      setTimeSlots(updatedSlots);
      updateFormData({ availability_slots: updatedSlots });
      
      setNewSlot({
        day: "",
        startTime: "",
        endTime: ""
      });
    }
  };

  const removeTimeSlot = (id: string) => {
    const updatedSlots = timeSlots.filter(slot => slot.id !== id);
    setTimeSlots(updatedSlots);
    updateFormData({ availability_slots: updatedSlots });
  };

  const handleUKBasedChange = (value: string) => {
    const isUK = value === "yes";
    setIsUKBased(isUK);
    updateFormData({ is_uk_based: isUK });
  };

  const groupedSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

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

      {/* Current Time Slots */}
      {Object.keys(groupedSlots).length > 0 && (
        <div className="space-y-4">
          <Label>Your Current Availability</Label>
          <div className="space-y-3">
            {daysOfWeek.map(day => {
              const daySlots = groupedSlots[day];
              if (!daySlots || daySlots.length === 0) return null;
              
              return (
                <Card key={day}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{day}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map(slot => (
                        <Badge
                          key={slot.id}
                          variant="outline"
                          className="flex items-center gap-2 px-3 py-1"
                        >
                          <Clock className="h-3 w-3" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                          <button
                            onClick={() => removeTimeSlot(slot.id)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Time Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Add Availability Slot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select value={newSlot.day} onValueChange={(value) => setNewSlot({ ...newSlot, day: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={newSlot.startTime} onValueChange={(value) => setNewSlot({ ...newSlot, startTime: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>End Time</Label>
              <Select value={newSlot.endTime} onValueChange={(value) => setNewSlot({ ...newSlot, endTime: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={addTimeSlot}
            disabled={!newSlot.day || !newSlot.startTime || !newSlot.endTime}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Time Slot
          </Button>
        </CardContent>
      </Card>

      {/* Quick Schedule Templates */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">⚡ Quick Templates</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const workingWeekSlots = [
                  { day: "Monday", startTime: "06:00", endTime: "18:00" },
                  { day: "Tuesday", startTime: "06:00", endTime: "18:00" },
                  { day: "Wednesday", startTime: "06:00", endTime: "18:00" },
                  { day: "Thursday", startTime: "06:00", endTime: "18:00" },
                  { day: "Friday", startTime: "06:00", endTime: "18:00" }
                ].map(slot => ({ ...slot, id: Date.now().toString() + Math.random() }));
                
                setTimeSlots(workingWeekSlots);
                updateFormData({ availability_slots: workingWeekSlots });
              }}
              className="mr-2 mb-2"
            >
              Monday-Friday 6am-6pm
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const fullWeekSlots = [
                  { day: "Monday", startTime: "06:00", endTime: "20:00" },
                  { day: "Tuesday", startTime: "06:00", endTime: "20:00" },
                  { day: "Wednesday", startTime: "06:00", endTime: "20:00" },
                  { day: "Thursday", startTime: "06:00", endTime: "20:00" },
                  { day: "Friday", startTime: "06:00", endTime: "20:00" },
                  { day: "Saturday", startTime: "08:00", endTime: "14:00" },
                  { day: "Sunday", startTime: "10:00", endTime: "16:00" }
                ].map(slot => ({ ...slot, id: Date.now().toString() + Math.random() }));
                
                setTimeSlots(fullWeekSlots);
                updateFormData({ availability_slots: fullWeekSlots });
              }}
              className="mr-2 mb-2"
            >
              Full Week Schedule
            </Button>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Click a template to quickly set up your schedule, then customize as needed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}