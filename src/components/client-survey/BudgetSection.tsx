import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Info, PoundSterling } from "lucide-react";

interface BudgetSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const budgetRanges = [
  { min: 0, max: 50, label: "Under £50/month", description: "Budget-friendly options" },
  { min: 50, max: 100, label: "£50-100/month", description: "Most popular range" },
  { min: 100, max: 200, label: "£100-200/month", description: "Premium options" },
  { min: 200, max: 500, label: "£200-500/month", description: "High-end coaching" },
  { min: 500, max: null, label: "£500+/month", description: "Luxury tier" },
];

const flexibilityOptions = [
  { 
    value: "strict", 
    label: "This is my strict budget", 
    description: "I need to stay within this range" 
  },
  { 
    value: "flexible", 
    label: "I'm somewhat flexible", 
    description: "I could stretch for the right trainer" 
  },
  { 
    value: "negotiable", 
    label: "Open to discussion", 
    description: "Budget depends on value provided" 
  }
];

export function BudgetSection({ formData, updateFormData, errors, clearFieldError }: BudgetSectionProps) {
  const handleBudgetRangeSelect = (range: any) => {
    updateFormData({ 
      budget_range_min: range.min, 
      budget_range_max: range.max 
    });
    // Clear any budget validation errors when a selection is made
    if (clearFieldError) {
      clearFieldError('budget_range');
    }
  };

  const handleCustomMinChange = (value: string) => {
    const numValue = value ? parseFloat(value) : null;
    updateFormData({ budget_range_min: numValue });
    // Clear validation errors when user starts typing
    if (clearFieldError && (numValue || formData.budget_range_max)) {
      clearFieldError('budget_range');
    }
  };

  const handleCustomMaxChange = (value: string) => {
    const numValue = value ? parseFloat(value) : null;
    updateFormData({ budget_range_max: numValue });
    // Clear validation errors when user starts typing
    if (clearFieldError && (numValue || formData.budget_range_min)) {
      clearFieldError('budget_range');
    }
  };

  const handleFlexibilityChange = (flexibility: string) => {
    updateFormData({ budget_flexibility: flexibility });
  };

  const getCurrentBudgetLabel = () => {
    const { budget_range_min, budget_range_max } = formData;
    if (!budget_range_min && !budget_range_max) return null;
    
    if (budget_range_min && budget_range_max) {
      return `£${budget_range_min}-${budget_range_max}/month`;
    } else if (budget_range_min && !budget_range_max) {
      return `£${budget_range_min}+/month`;
    } else if (!budget_range_min && budget_range_max) {
      return `Under £${budget_range_max}/month`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What's your budget range? *</h2>
        <p className="text-muted-foreground">
          Please select either a quick range or set custom values. This helps us match you with suitable trainers.
        </p>
        {errors?.budget_range && (
          <p className="text-sm text-destructive font-medium">{errors.budget_range}</p>
        )}
      </div>

      {/* Budget Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200">Budget Guidelines</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Personal trainer rates typically range from £30-80 per session. Monthly packages often provide better value.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Budget Ranges */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Quick Budget Ranges *</Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {budgetRanges.map((range, index) => {
            // Handle budget matching more flexibly - treat null min as 0 for comparison
            const formMin = formData.budget_range_min ?? 0;
            const rangeMin = range.min ?? 0;
            const isSelected = formMin === rangeMin && formData.budget_range_max === range.max;
            
            return (
              <Card 
                key={index}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleBudgetRangeSelect(range)}
              >
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold">{range.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {range.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Budget Range */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Or set a custom range *</Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min-budget">Minimum budget (monthly)</Label>
            <div className="relative">
              <PoundSterling className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="min-budget"
                type="number"
                placeholder="0"
                value={formData.budget_range_min || ""}
                onChange={(e) => handleCustomMinChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-budget">Maximum budget (monthly)</Label>
            <div className="relative">
              <PoundSterling className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="max-budget"
                type="number"
                placeholder="No limit"
                value={formData.budget_range_max || ""}
                onChange={(e) => handleCustomMaxChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Flexibility */}
      {(formData.budget_range_min || formData.budget_range_max) && (
        <div className="space-y-4">
          <Label className="text-base font-semibold">How flexible is this budget?</Label>
          
          <Select 
            value={formData.budget_flexibility || "flexible"} 
            onValueChange={handleFlexibilityChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your budget flexibility" />
            </SelectTrigger>
            <SelectContent>
              {flexibilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Budget Summary */}
      {getCurrentBudgetLabel() && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Your Budget Range</h4>
                <Badge variant="secondary" className="mt-1">
                  {getCurrentBudgetLabel()}
                </Badge>
              </div>
              {formData.budget_flexibility && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {flexibilityOptions.find(opt => opt.value === formData.budget_flexibility)?.label}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Note */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Required:</strong> Please select either a quick budget range above or set custom min/max values to continue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}