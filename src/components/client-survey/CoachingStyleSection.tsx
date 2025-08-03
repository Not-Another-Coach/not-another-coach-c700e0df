import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Zap, Target, Users, Award, Smile } from "lucide-react";

interface CoachingStyleSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const coachingStyleOptions = [
  {
    id: "nurturing",
    label: "Nurturing & Supportive",
    icon: <Heart className="h-6 w-6" />,
    description: "Gentle encouragement, patience, and emotional support",
    keywords: ["Encouraging", "Patient", "Understanding", "Supportive"]
  },
  {
    id: "tough_love",
    label: "Tough Love",
    icon: <Target className="h-6 w-6" />,
    description: "Direct feedback, high standards, and accountability",
    keywords: ["Direct", "Challenging", "Accountability", "High standards"]
  },
  {
    id: "high_energy",
    label: "High Energy",
    icon: <Zap className="h-6 w-6" />,
    description: "Enthusiastic, motivating, and energetic approach",
    keywords: ["Energetic", "Enthusiastic", "Motivating", "Dynamic"]
  },
  {
    id: "analytical",
    label: "Technical & Analytical",
    icon: <Award className="h-6 w-6" />,
    description: "Data-driven, precise form correction, and detailed explanations",
    keywords: ["Data-focused", "Technical", "Precise", "Educational"]
  },
  {
    id: "social",
    label: "Social & Fun",
    icon: <Users className="h-6 w-6" />,
    description: "Interactive, social, and makes fitness enjoyable",
    keywords: ["Fun", "Social", "Interactive", "Enjoyable"]
  },
  {
    id: "calm",
    label: "Calm & Mindful",
    icon: <Smile className="h-6 w-6" />,
    description: "Peaceful approach focusing on mind-body connection",
    keywords: ["Calm", "Mindful", "Peaceful", "Balanced"]
  }
];

const motivationFactors = [
  "Positive reinforcement",
  "Celebrating small wins",
  "Setting clear goals",
  "Friendly competition",
  "Progress tracking",
  "Personal connection",
  "Variety in workouts",
  "Understanding my 'why'",
  "Flexible expectations",
  "Professional expertise"
];

export function CoachingStyleSection({ formData, updateFormData, errors, clearFieldError }: CoachingStyleSectionProps) {
  const handleCoachingStyleToggle = (styleId: string) => {
    const current = formData.preferred_coaching_style || [];
    const updated = current.includes(styleId)
      ? current.filter((style: string) => style !== styleId)
      : [...current, styleId];
    updateFormData({ preferred_coaching_style: updated });
    clearFieldError?.('preferred_coaching_style');
  };

  const handleMotivationFactorToggle = (factor: string) => {
    const current = formData.motivation_factors || [];
    const updated = current.includes(factor)
      ? current.filter((f: string) => f !== factor)
      : [...current, factor];
    updateFormData({ motivation_factors: updated });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What coaching style motivates you?</h2>
        <p className="text-muted-foreground">
          Help us match you with a trainer whose approach fits your personality
        </p>
      </div>

      {/* Coaching Style Preferences */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Preferred Coaching Styles *</Label>
          <p className="text-sm text-muted-foreground">
            Select the coaching approaches that work best for you (choose 1-3)
          </p>
        </div>
        
        {errors?.preferred_coaching_style && (
          <p className="text-sm text-destructive">{errors.preferred_coaching_style}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coachingStyleOptions.map((style) => {
            const isSelected = formData.preferred_coaching_style?.includes(style.id);
            
            return (
              <Card 
                key={style.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleCoachingStyleToggle(style.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleCoachingStyleToggle(style.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-primary">{style.icon}</div>
                        <h3 className="font-semibold">{style.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {style.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {style.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Motivation Factors */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">What keeps you motivated? (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Select the factors that help keep you engaged and motivated
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {motivationFactors.map((factor) => {
            const isSelected = formData.motivation_factors?.includes(factor);
            
            return (
              <Badge
                key={factor}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer px-3 py-2 text-sm"
                onClick={() => handleMotivationFactorToggle(factor)}
              >
                {factor}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Selection Summary */}
      {formData.preferred_coaching_style?.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Your Coaching Preferences</h4>
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Preferred styles:</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.preferred_coaching_style.map((styleId: string) => {
                    const style = coachingStyleOptions.find(s => s.id === styleId);
                    return style ? (
                      <Badge key={styleId} variant="secondary">
                        {style.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
              
              {formData.motivation_factors?.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Motivation factors:</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.motivation_factors.slice(0, 5).map((factor: string) => (
                      <Badge key={factor} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                    {formData.motivation_factors.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{formData.motivation_factors.length - 5} more
                      </Badge>
                    )}
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