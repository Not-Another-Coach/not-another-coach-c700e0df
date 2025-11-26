import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Users, Zap } from "lucide-react";

interface AvailabilitySectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const waitlistOptions = [
  {
    id: "asap",
    label: "Suggest alternatives",
    icon: <Clock className="h-6 w-6" />,
    description: "I'll take the first available trainer who's a good match",
    benefit: "Get started quickly with an available trainer"
  },
  {
    id: "quality_over_speed",
    label: "I'd rather wait for the right trainer",
    icon: <Users className="h-6 w-6" />,
    description: "I'm willing to wait for a trainer who's the perfect fit",
    benefit: "Better long-term match and results"
  }
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

export function AvailabilitySection({ formData, updateFormData, errors, clearFieldError }: AvailabilitySectionProps) {
  const handleWaitlistPreferenceChange = (preference: "asap" | "quality_over_speed") => {
    // Convert string values to boolean for database compatibility
    // "asap" = true (wants to start immediately)
    // "quality_over_speed" = false (willing to wait for better match)
    const booleanValue = preference === "asap";
    updateFormData({ waitlist_preference: booleanValue });
    clearFieldError?.('waitlist_preference');
  };

  // Helper function to get current selection based on boolean value
  // Returns null if nothing is selected yet (formData.waitlist_preference is null or undefined)
  const getCurrentSelection = () => {
    if (formData.waitlist_preference === null || formData.waitlist_preference === undefined) {
      return null;
    }
    if (formData.waitlist_preference === true) return "asap";
    if (formData.waitlist_preference === false) return "quality_over_speed";
    return null;
  };

  const handleFlexibleSchedulingToggle = (checked: boolean) => {
    updateFormData({ flexible_scheduling: checked });
  };

  const handleStartTimelineChange = (timeline: string) => {
    updateFormData({ start_timeline: timeline });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Final step: Your availability preferences</h2>
        <p className="text-muted-foreground">
          Let's finalize how you'd like to match with trainers
        </p>
      </div>

      {/* Start Timeline */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">When would you like to start?</Label>
          <p className="text-sm text-muted-foreground">
            This helps us prioritize trainer availability for you
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

      {/* Waitlist Preference */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">If your ideal trainer isn't immediately available</Label>
          <p className="text-sm text-muted-foreground">
            How would you prefer to handle trainer availability?
          </p>
        </div>
        
        {errors?.waitlist_preference && (
          <p className="text-sm text-destructive">{errors.waitlist_preference}</p>
        )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {waitlistOptions.map((option) => {
             const isSelected = getCurrentSelection() === option.id;
             
             return (
               <Card 
                 key={option.id}
                 className={`cursor-pointer transition-all hover:shadow-md ${
                   isSelected ? 'border-primary bg-primary/5' : ''
                 }`}
                 onClick={() => handleWaitlistPreferenceChange(option.id as any)}
               >
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-3">
                    <div className="flex justify-center text-primary">
                      {option.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      <span className="font-medium">Benefit:</span> {option.benefit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

    </div>
  );
}