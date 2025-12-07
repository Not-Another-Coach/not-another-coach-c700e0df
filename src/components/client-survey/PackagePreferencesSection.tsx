import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Infinity, Calendar, Clock } from "lucide-react";

interface PackagePreferencesSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const packageOptions = [
  {
    id: "ongoing",
    label: "Ongoing Support",
    icon: <Infinity className="h-8 w-8" />,
    description: "Long-term coaching relationship with continuous support",
    benefits: ["Sustainable results", "Habit formation", "Regular adjustments", "Long-term accountability"],
    bestFor: "People who want lasting lifestyle changes"
  },
  {
    id: "short_term",
    label: "Short-Term Plan",
    icon: <Calendar className="h-8 w-8" />,
    description: "Focused program with a specific end date (4-12 weeks)",
    benefits: ["Clear timeline", "Intensive focus", "Specific goals", "Defined commitment"],
    bestFor: "People with specific short-term goals"
  },
  {
    id: "single_session",
    label: "Single Sessions",
    icon: <Clock className="h-8 w-8" />,
    description: "Book individual sessions as needed with flexibility",
    benefits: ["Maximum flexibility", "No long commitment", "Pay as you go", "Schedule when convenient"],
    bestFor: "People with unpredictable schedules"
  }
];

export function PackagePreferencesSection({ formData, updateFormData, errors, clearFieldError }: PackagePreferencesSectionProps) {
  const handlePackageTypeChange = (packageType: "ongoing" | "short_term" | "single_session") => {
    updateFormData({ preferred_package_type: packageType });
    clearFieldError?.('preferred_package_type');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What type of training arrangement works for you?</h2>
        <p className="text-muted-foreground">
          Choose the structure that best fits your goals and lifestyle
        </p>
      </div>

      {/* Package Type Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Training Structure *</Label>
        
        {errors?.preferred_package_type && (
          <p className="text-sm text-destructive">{errors.preferred_package_type}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packageOptions.map((option) => {
            const isSelected = formData.preferred_package_type === option.id;
            
            return (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'border-primary bg-primary/5 shadow-md' : ''
                }`}
                onClick={() => handlePackageTypeChange(option.id as any)}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="text-center space-y-3">
                    <div className="flex justify-center text-primary">
                      {option.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Benefits:</h4>
                    <ul className="space-y-1">
                      {option.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center">
                          <span className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Best For */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Best for:</span> {option.bestFor}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Additional Info */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h4 className="font-medium text-sm">💡 Good to know</h4>
            <p className="text-xs text-muted-foreground">
              Many trainers offer flexible arrangements. You can always discuss adjusting your package type after you match with a trainer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}