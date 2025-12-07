import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, Zap, UserCheck, Phone } from "lucide-react";

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
    id: "asap", 
    label: "ASAP", 
    description: "I want to start within the next week",
    icon: <Zap className="h-5 w-5" />
  },
  { 
    id: "within_month", 
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

const trainerGenderPreferenceOptions = [
  { value: "no_preference", label: "No preference" },
  { value: "male", label: "Male trainer" },
  { value: "female", label: "Female trainer" }
];

const discoveryCallPreferenceOptions = [
  { value: "required", label: "I'd like a discovery call first", description: "I want to chat before committing" },
  { value: "prefer_no", label: "I'd rather skip it", description: "Let's get straight to training" },
  { value: "flexible", label: "I'm flexible", description: "Either way works for me" }
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

      {/* Trainer Gender Preference */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Trainer Gender Preference
          </Label>
          <p className="text-sm text-muted-foreground">
            Do you have a preference for your trainer's gender?
          </p>
        </div>

        <Select 
          value={formData.trainer_gender_preference || "no_preference"} 
          onValueChange={(value) => {
            updateFormData({ trainer_gender_preference: value });
            clearFieldError?.('trainer_gender_preference');
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preference" />
          </SelectTrigger>
          <SelectContent>
            {trainerGenderPreferenceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Discovery Call Preference */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Discovery Call Preference
          </Label>
          <p className="text-sm text-muted-foreground">
            Would you like a discovery call before starting with a trainer?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {discoveryCallPreferenceOptions.map((option) => {
            const isSelected = formData.discovery_call_preference === option.value;
            
            return (
              <Card 
                key={option.value}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => {
                  updateFormData({ discovery_call_preference: option.value });
                  clearFieldError?.('discovery_call_preference');
                }}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <h3 className="font-semibold">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

    </div>
  );
}