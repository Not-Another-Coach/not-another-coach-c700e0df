import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Zap, Heart, Shield, Dumbbell, TrendingUp } from "lucide-react";

interface GoalsSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const goalOptions = [
  { 
    id: "weight_loss", 
    label: "Weight Loss", 
    icon: <TrendingUp className="h-5 w-5" />,
    description: "Lose weight and improve body composition"
  },
  { 
    id: "strength_training", 
    label: "Strength Training", 
    icon: <Dumbbell className="h-5 w-5" />,
    description: "Build muscle and increase strength"
  },
  { 
    id: "fitness_health", 
    label: "General Fitness & Health", 
    icon: <Heart className="h-5 w-5" />,
    description: "Improve overall health and fitness"
  },
  { 
    id: "energy_confidence", 
    label: "Energy & Confidence", 
    icon: <Zap className="h-5 w-5" />,
    description: "Boost energy levels and self-confidence"
  },
  { 
    id: "injury_prevention", 
    label: "Injury Prevention", 
    icon: <Shield className="h-5 w-5" />,
    description: "Prevent injuries and improve mobility"
  },
  { 
    id: "specific_sport", 
    label: "Sport-Specific Training", 
    icon: <Target className="h-5 w-5" />,
    description: "Train for a specific sport or activity"
  },
];

const secondaryGoals = [
  "Improve flexibility",
  "Better sleep quality",
  "Stress reduction",
  "Improve posture",
  "Increase endurance",
  "Social fitness",
  "Learn proper form",
  "Habit building"
];

export function GoalsSection({ formData, updateFormData, errors, clearFieldError }: GoalsSectionProps) {
  const handlePrimaryGoalToggle = (goalId: string) => {
    const current = formData.primary_goals || [];
    const updated = current.includes(goalId)
      ? current.filter((g: string) => g !== goalId)
      : [...current, goalId];
    updateFormData({ primary_goals: updated });
    clearFieldError?.('primary_goals');
  };

  const handleSecondaryGoalToggle = (goal: string) => {
    const current = formData.secondary_goals || [];
    const updated = current.includes(goal)
      ? current.filter((g: string) => g !== goal)
      : [...current, goal];
    updateFormData({ secondary_goals: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What are your fitness goals?</h2>
        <p className="text-muted-foreground">
          Select your main goals so we can match you with the right trainer
        </p>
      </div>

      {/* Primary Goals */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Primary Goals *</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Choose your top priorities (select 1-3)
          </p>
        </div>
        
        {errors?.primary_goals && (
          <p className="text-sm text-destructive">{errors.primary_goals}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goalOptions.map((goal) => {
            const isSelected = formData.primary_goals?.includes(goal.id);
            
            return (
              <Card 
                key={goal.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handlePrimaryGoalToggle(goal.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handlePrimaryGoalToggle(goal.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {goal.icon}
                        <h3 className="font-medium">{goal.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Secondary Goals */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Additional Benefits (Optional)</Label>
          <p className="text-sm text-muted-foreground mb-4">
            What other benefits are you looking for?
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {secondaryGoals.map((goal) => {
            const isSelected = formData.secondary_goals?.includes(goal);
            
            return (
              <Badge
                key={goal}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => handleSecondaryGoalToggle(goal)}
              >
                {goal}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Selected Goals Summary */}
      {formData.primary_goals?.length > 0 && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Your Goals Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Primary Goals:</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.primary_goals.map((goalId: string) => {
                    const goal = goalOptions.find(g => g.id === goalId);
                    return goal ? (
                      <Badge key={goalId} variant="secondary">
                        {goal.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
              
              {formData.secondary_goals?.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Additional Benefits:</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.secondary_goals.map((goal: string) => (
                      <Badge key={goal} variant="outline" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}