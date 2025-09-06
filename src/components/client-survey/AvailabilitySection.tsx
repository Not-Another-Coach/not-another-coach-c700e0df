import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Users } from "lucide-react";

interface AvailabilitySectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const waitlistOptions = [
  {
    id: "asap",
    label: "I need to start ASAP",
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

export function AvailabilitySection({ formData, updateFormData, errors, clearFieldError }: AvailabilitySectionProps) {
  const handleWaitlistPreferenceChange = (preference: "asap" | "quality_over_speed") => {
    updateFormData({ waitlist_preference: preference });
    clearFieldError?.('waitlist_preference');
  };

  const handleFlexibleSchedulingToggle = (checked: boolean) => {
    updateFormData({ flexible_scheduling: checked });
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
            const isSelected = formData.waitlist_preference === option.id;
            
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

      {/* Flexible Scheduling */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="flexible-scheduling"
              checked={formData.flexible_scheduling ?? false}
              onCheckedChange={handleFlexibleSchedulingToggle}
            />
            <div className="flex-1">
              <Label htmlFor="flexible-scheduling" className="font-medium cursor-pointer">
                I'm open to adjusting my schedule for the right trainer
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                This increases your chances of finding a great match by being flexible with timing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary of Survey */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Calendar className="h-12 w-12 mx-auto text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Almost done!</h3>
              <p className="text-muted-foreground mt-2">
                You're about to complete your fitness journey profile. Once finished, we'll match you with trainers who fit your goals, style, and schedule.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formData.primary_goals?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Goals set</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formData.preferred_time_slots?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Time slots</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formData.preferred_coaching_style?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Style prefs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formData.preferred_training_frequency || 0}
                </div>
                <div className="text-xs text-muted-foreground">Days/week</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}