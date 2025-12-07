import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Zap, Heart, Shield, Dumbbell, TrendingUp, Activity, Brain, Users, Moon, Flame, BookOpen, Calendar, AlignVerticalJustifyCenter, Loader2 } from "lucide-react";
import { useActiveClientGoals, ClientGoal } from "@/hooks/useClientGoals";

interface GoalsSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

// Map icon names to Lucide icon components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  TrendingUp,
  Dumbbell,
  Heart,
  Zap,
  Shield,
  Activity,
  Brain,
  Users,
  Moon,
  Flame,
  BookOpen,
  Calendar,
  AlignVerticalJustifyCenter,
};

function getIconComponent(iconName: string) {
  return ICON_MAP[iconName] || Target;
}

export function GoalsSection({ formData, updateFormData, errors, clearFieldError }: GoalsSectionProps) {
  const { primaryGoals, secondaryGoals, loading } = useActiveClientGoals();

  const handlePrimaryGoalToggle = (goalKey: string) => {
    const current = formData.primary_goals || [];
    const updated = current.includes(goalKey)
      ? current.filter((g: string) => g !== goalKey)
      : [...current, goalKey];
    updateFormData({ primary_goals: updated });
    clearFieldError?.('primary_goals');
  };

  const handleSecondaryGoalToggle = (goalKey: string) => {
    const current = formData.secondary_goals || [];
    const updated = current.includes(goalKey)
      ? current.filter((g: string) => g !== goalKey)
      : [...current, goalKey];
    updateFormData({ secondary_goals: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          {primaryGoals.map((goal) => {
            const isSelected = formData.primary_goals?.includes(goal.goal_key);
            const IconComponent = getIconComponent(goal.icon);
            
            return (
              <Card 
                key={goal.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handlePrimaryGoalToggle(goal.goal_key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handlePrimaryGoalToggle(goal.goal_key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="h-5 w-5" />
                        <h3 className="font-medium">{goal.label}</h3>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Secondary Goals */}
      {secondaryGoals.length > 0 && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Additional Benefits (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-4">
              What other benefits are you looking for?
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {secondaryGoals.map((goal) => {
              const isSelected = formData.secondary_goals?.includes(goal.goal_key);
              
              return (
                <Badge
                  key={goal.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => handleSecondaryGoalToggle(goal.goal_key)}
                >
                  {goal.label}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

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
                  {formData.primary_goals.map((goalKey: string) => {
                    const goal = primaryGoals.find(g => g.goal_key === goalKey);
                    return goal ? (
                      <Badge key={goalKey} variant="secondary">
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
                    {formData.secondary_goals.map((goalKey: string) => {
                      const goal = secondaryGoals.find(g => g.goal_key === goalKey);
                      return goal ? (
                        <Badge key={goalKey} variant="outline" className="text-xs">
                          {goal.label}
                        </Badge>
                      ) : (
                        <Badge key={goalKey} variant="outline" className="text-xs">
                          {goalKey}
                        </Badge>
                      );
                    })}
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
