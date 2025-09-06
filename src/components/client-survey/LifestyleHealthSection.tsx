import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Home, Calendar, Shield, Target } from "lucide-react";

interface LifestyleHealthSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const equipmentOptions = [
  {
    id: "no_equipment",
    label: "No equipment – just bodyweight",
    icon: <Home className="h-5 w-5" />
  },
  {
    id: "basic_kit",
    label: "Some basic kit (e.g. dumbbells, bands, yoga mat)",
    icon: <Home className="h-5 w-5" />
  },
  {
    id: "home_gym",
    label: "Full home gym setup",
    icon: <Home className="h-5 w-5" />
  },
  {
    id: "commercial_gym",
    label: "Access to a commercial gym",
    icon: <Home className="h-5 w-5" />
  }
];

const lifestyleOptions = [
  {
    id: "parent_carer",
    label: "Parent / Carer"
  },
  {
    id: "full_time_work",
    label: "Full-time work"
  },
  {
    id: "shift_work",
    label: "Shift work"
  },
  {
    id: "flexible_schedule",
    label: "Flexible schedule"
  },
  {
    id: "retired_not_working",
    label: "Retired / Not working"
  },
  {
    id: "other",
    label: "Other"
  }
];

export function LifestyleHealthSection({ formData, updateFormData, errors, clearFieldError }: LifestyleHealthSectionProps) {
  const handleLocationChange = (value: string) => {
    updateFormData({ location: value });
    clearFieldError?.('location');
  };

  const handleEquipmentChange = (value: string) => {
    updateFormData({ fitness_equipment_access: value });
    clearFieldError?.('fitness_equipment_access');
  };

  const handleLifestyleChange = (lifestyleId: string, checked: boolean) => {
    const currentLifestyle = formData.lifestyle_description || [];
    let updatedLifestyle;

    if (checked) {
      updatedLifestyle = [...currentLifestyle, lifestyleId];
    } else {
      updatedLifestyle = currentLifestyle.filter((item: string) => item !== lifestyleId);
    }

    updateFormData({ lifestyle_description: updatedLifestyle });
    clearFieldError?.('lifestyle_description');
  };

  const handleLifestyleOtherChange = (value: string) => {
    updateFormData({ lifestyle_other: value });
  };

  const handleHealthConditionsChange = (value: string) => {
    updateFormData({ health_conditions: value });
  };

  const handleSpecificEventChange = (value: string) => {
    updateFormData({ has_specific_event: value });
    if (value === "no") {
      updateFormData({ specific_event_details: "" });
    }
    clearFieldError?.('has_specific_event');
  };

  const handleEventDetailsChange = (value: string) => {
    updateFormData({ specific_event_details: value });
  };

  const isLifestyleSelected = (lifestyleId: string) => {
    return (formData.lifestyle_description || []).includes(lifestyleId);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Heart className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Lifestyle & Health</h2>
        <p className="text-muted-foreground">
          Help us understand your lifestyle and health considerations
        </p>
      </div>

      {/* Question 1: Location */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="text-base font-semibold">Where are you based?</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Town/City + Postcode if comfortable sharing
            </p>
          </div>
          
          {errors?.location && (
            <p className="text-sm text-destructive">{errors.location}</p>
          )}

          <Input
            placeholder="e.g., London SW1A 1AA"
            value={formData.location || ""}
            onChange={(e) => handleLocationChange(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Question 2: Equipment Access */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="text-base font-semibold">Do you have access to fitness equipment?</Label>
          </div>
          
          {errors?.fitness_equipment_access && (
            <p className="text-sm text-destructive">{errors.fitness_equipment_access}</p>
          )}

          <RadioGroup
            value={formData.fitness_equipment_access || ""}
            onValueChange={handleEquipmentChange}
            className="space-y-3"
          >
            {equipmentOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value={option.id} id={option.id} />
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-primary">
                    {option.icon}
                  </div>
                  <Label htmlFor={option.id} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Question 3: Lifestyle */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="text-base font-semibold">Which best describes your current lifestyle?</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Select all that apply
            </p>
          </div>
          
          {errors?.lifestyle_description && (
            <p className="text-sm text-destructive">{errors.lifestyle_description}</p>
          )}

          <div className="space-y-3">
            {lifestyleOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50">
                <Checkbox
                  id={option.id}
                  checked={isLifestyleSelected(option.id)}
                  onCheckedChange={(checked) => handleLifestyleChange(option.id, checked as boolean)}
                />
                <Label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>

          {isLifestyleSelected('other') && (
            <div className="mt-4">
              <Label className="text-sm font-medium">Please specify:</Label>
              <Input
                placeholder="Please describe..."
                value={formData.lifestyle_other || ""}
                onChange={(e) => handleLifestyleOtherChange(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question 4: Health Conditions */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="text-base font-semibold">Do you have any health conditions, injuries, or accessibility needs your trainer should know about?</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Optional - This helps us match you with trainers who have relevant experience
            </p>
          </div>

          <Textarea
            placeholder="Please describe any health conditions, injuries, or accessibility needs (optional)"
            value={formData.health_conditions || ""}
            onChange={(e) => handleHealthConditionsChange(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Question 5: Specific Event */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="text-base font-semibold">Do you have a specific event or date tied to your fitness goal?</Label>
          </div>
          
          {errors?.has_specific_event && (
            <p className="text-sm text-destructive">{errors.has_specific_event}</p>
          )}

          <RadioGroup
            value={formData.has_specific_event || ""}
            onValueChange={handleSpecificEventChange}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="yes" id="yes_event" />
              <div className="flex items-center space-x-3 flex-1">
                <Target className="h-5 w-5 text-primary" />
                <Label htmlFor="yes_event" className="cursor-pointer flex-1">
                  Yes (please specify)
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="no" id="no_event" />
              <div className="flex items-center space-x-3 flex-1">
                <Calendar className="h-5 w-5 text-primary" />
                <Label htmlFor="no_event" className="cursor-pointer flex-1">
                  No – I just want long-term progress
                </Label>
              </div>
            </div>
          </RadioGroup>

          {formData.has_specific_event === "yes" && (
            <div className="mt-4">
              <Label className="text-sm font-medium">Event/Date details:</Label>
              <Input
                placeholder="e.g., Wedding in June 2024, Marathon in September"
                value={formData.specific_event_details || ""}
                onChange={(e) => handleEventDetailsChange(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}