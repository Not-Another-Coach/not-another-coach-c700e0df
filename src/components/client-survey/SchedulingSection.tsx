import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Zap } from "lucide-react";

interface SchedulingSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const frequencyOptions = [
  { value: 1, label: "1 day per week", description: "Light commitment" },
  { value: 2, label: "2 days per week", description: "Good for beginners" },
  { value: 3, label: "3 days per week", description: "Most popular choice" },
  { value: 4, label: "4 days per week", description: "Serious commitment" },
  { value: 5, label: "5+ days per week", description: "High intensity" },
];

const timeSlotOptions = [
  { id: "early_morning", label: "Early Morning", time: "6:00 - 9:00 AM", icon: "🌅" },
  { id: "morning", label: "Morning", time: "9:00 AM - 12:00 PM", icon: "☀️" },
  { id: "lunch", label: "Lunch Time", time: "12:00 - 2:00 PM", icon: "🍽️" },
  { id: "afternoon", label: "Afternoon", time: "2:00 - 6:00 PM", icon: "🌤️" },
  { id: "evening", label: "Evening", time: "6:00 - 9:00 PM", icon: "🌆" },
  { id: "weekend", label: "Weekends", time: "Flexible timing", icon: "🏖️" },
];

const startTimelineOptions = [
  { 
    id: "urgent", 
    label: "ASAP", 
    description: "I want to start within the next week",
    icon: <Zap className="h-5 w-5" />
  },
  { 
    id: "next_month", 
    label: "Within a month", 
    description: "I'm ready to start soon but not rushing",
    icon: <Calendar className="h-5 w-5" />
  },
  { 
    id: "flexible", 
    label: "I'm flexible", 
    description: "I'll wait for the right trainer match",
    icon: <Clock className="h-5 w-5" />
  },
];

export function SchedulingSection({ formData, updateFormData, errors, clearFieldError }: SchedulingSectionProps) {
  const handleFrequencyChange = (frequency: number) => {
    updateFormData({ preferred_training_frequency: frequency });
    clearFieldError?.('preferred_training_frequency');
  };

  const handleTimeSlotToggle = (timeSlot: string) => {
    const current = formData.preferred_time_slots || [];
    const updated = current.includes(timeSlot)
      ? current.filter((slot: string) => slot !== timeSlot)
      : [...current, timeSlot];
    updateFormData({ preferred_time_slots: updated });
    clearFieldError?.('preferred_time_slots');
  };

  const handleStartTimelineChange = (timeline: string) => {
    updateFormData({ start_timeline: timeline });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Let's plan your training schedule</h2>
        <p className="text-muted-foreground">
          Help us understand your availability and commitment level
        </p>
      </div>

      {/* Training Frequency */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">How often would you like to train? *</Label>
          <p className="text-sm text-muted-foreground">
            This helps us match you with trainers who can accommodate your schedule
          </p>
        </div>
        
        {errors?.preferred_training_frequency && (
          <p className="text-sm text-destructive">{errors.preferred_training_frequency}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {frequencyOptions.map((option) => {
            const isSelected = formData.preferred_training_frequency === option.value;
            
            return (
              <Button
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                className="h-auto p-4 justify-start"
                onClick={() => handleFrequencyChange(option.value)}
              >
                <div className="text-left">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs opacity-80">{option.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">When are you usually available? *</Label>
          <p className="text-sm text-muted-foreground">
            Select all time slots that work for you (you can select multiple)
          </p>
        </div>
        
        {errors?.preferred_time_slots && (
          <p className="text-sm text-destructive">{errors.preferred_time_slots}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeSlotOptions.map((slot) => {
            const isSelected = formData.preferred_time_slots?.includes(slot.id);
            
            return (
              <Card 
                key={slot.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleTimeSlotToggle(slot.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleTimeSlotToggle(slot.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{slot.icon}</span>
                        <h3 className="font-medium">{slot.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{slot.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Start Timeline */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">When would you like to start?</Label>
          <p className="text-sm text-muted-foreground">
            This helps us prioritize trainer availability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {startTimelineOptions.map((option) => {
            const isSelected = formData.start_timeline === option.id;
            
            return (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleStartTimelineChange(option.id)}
              >
                <CardContent className="p-4 text-center space-y-3">
                  <div className="flex justify-center text-primary">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{option.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Schedule Summary */}
      {formData.preferred_training_frequency && formData.preferred_time_slots?.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Your Schedule Preferences</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Frequency:</span> {
                  frequencyOptions.find(opt => opt.value === formData.preferred_training_frequency)?.label
                }
              </div>
              <div>
                <span className="font-medium">Available times:</span>{" "}
                {formData.preferred_time_slots.map((slotId: string) => {
                  const slot = timeSlotOptions.find(s => s.id === slotId);
                  return slot?.label;
                }).join(", ")}
              </div>
              {formData.start_timeline && (
                <div>
                  <span className="font-medium">Start date:</span>{" "}
                  {startTimelineOptions.find(opt => opt.id === formData.start_timeline)?.label}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}