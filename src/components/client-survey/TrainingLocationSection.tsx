import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Monitor, Globe } from "lucide-react";

interface TrainingLocationSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const locationOptions = [
  {
    id: "in-person",
    label: "In-Person Training",
    icon: <MapPin className="h-8 w-8" />,
    description: "Meet your trainer at a gym or outdoor location",
    benefits: ["Personal attention", "Equipment access", "Immediate form correction"]
  },
  {
    id: "online",
    label: "Online Training",
    icon: <Monitor className="h-8 w-8" />,
    description: "Train from home via video calls",
    benefits: ["Convenience", "No travel time", "Train anywhere"]
  },
  {
    id: "hybrid",
    label: "Hybrid (Both)",
    icon: <Globe className="h-8 w-8" />,
    description: "Combination of in-person and online sessions",
    benefits: ["Flexibility", "Best of both worlds", "Adaptable schedule"]
  }
];

export function TrainingLocationSection({ formData, updateFormData, errors, clearFieldError }: TrainingLocationSectionProps) {
  const handleLocationChange = (location: "in-person" | "online" | "hybrid") => {
    updateFormData({ training_location_preference: location });
    clearFieldError?.('training_location_preference');
  };

  const handleVirtualCoachingToggle = (checked: boolean) => {
    updateFormData({ open_to_virtual_coaching: checked });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Where would you like to train?</h2>
        <p className="text-muted-foreground">
          Choose your preferred training environment
        </p>
      </div>

      {/* Location Preference */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Training Location *</Label>
        
        {errors?.training_location_preference && (
          <p className="text-sm text-destructive">{errors.training_location_preference}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {locationOptions.map((option) => {
            const isSelected = formData.training_location_preference === option.id;
            
            return (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleLocationChange(option.id as any)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center text-primary">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{option.label}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {option.description}
                    </p>
                    <div className="space-y-1">
                      {option.benefits.map((benefit, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          • {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Virtual Coaching Openness */}
      {formData.training_location_preference === "in-person" && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="virtual-coaching"
                checked={formData.open_to_virtual_coaching || false}
                onCheckedChange={handleVirtualCoachingToggle}
              />
              <div className="flex-1">
                <Label htmlFor="virtual-coaching" className="font-medium cursor-pointer">
                  I'm open to occasional virtual coaching sessions
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  This gives you more flexibility and access to more trainers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}