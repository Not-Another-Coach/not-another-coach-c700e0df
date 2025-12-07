import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Zap, Target, Users, Award, Smile, Leaf, BookOpen, Flame, Sparkles, ThumbsUp, TrendingUp, Trophy, Shuffle, Lightbulb, GraduationCap } from "lucide-react";
import { useClientCoachingStyles } from "@/hooks/useClientCoachingStyles";
import { useClientMotivators } from "@/hooks/useClientMotivators";

interface CoachingStyleSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

// Icon mapping for dynamic icons from database
const iconMap: Record<string, React.ReactNode> = {
  Heart: <Heart className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Target: <Target className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  Award: <Award className="h-6 w-6" />,
  Smile: <Smile className="h-6 w-6" />,
  Leaf: <Leaf className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
  Flame: <Flame className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
  ThumbsUp: <ThumbsUp className="h-6 w-6" />,
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  Trophy: <Trophy className="h-6 w-6" />,
  Shuffle: <Shuffle className="h-6 w-6" />,
  Lightbulb: <Lightbulb className="h-6 w-6" />,
  GraduationCap: <GraduationCap className="h-6 w-6" />,
};

export function CoachingStyleSection({ formData, updateFormData, errors, clearFieldError }: CoachingStyleSectionProps) {
  // Fetch coaching styles from database
  const { data: coachingStyleOptions, isLoading: stylesLoading } = useClientCoachingStyles();
  // Fetch motivators from database
  const { data: motivatorOptions, isLoading: motivatorsLoading } = useClientMotivators();

  const handleCoachingStyleToggle = (styleKey: string) => {
    const current = formData.preferred_coaching_style || [];
    const updated = current.includes(styleKey)
      ? current.filter((style: string) => style !== styleKey)
      : [...current, styleKey];
    updateFormData({ preferred_coaching_style: updated });
    clearFieldError?.('preferred_coaching_style');
  };

  const handleMotivationFactorToggle = (motivatorKey: string) => {
    const current = formData.motivation_factors || [];
    const updated = current.includes(motivatorKey)
      ? current.filter((f: string) => f !== motivatorKey)
      : [...current, motivatorKey];
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

        {stylesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coachingStyleOptions?.map((style) => {
              const isSelected = formData.preferred_coaching_style?.includes(style.style_key);
              
              return (
                <Card 
                  key={style.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleCoachingStyleToggle(style.style_key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleCoachingStyleToggle(style.style_key)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-primary">{iconMap[style.icon || 'Heart'] || iconMap.Heart}</div>
                          <h3 className="font-semibold">{style.label}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {style.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {style.keywords?.map((keyword, index) => (
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
        )}
      </div>

      {/* Motivation Factors */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">What keeps you motivated? (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Select the factors that help keep you engaged and motivated
          </p>
        </div>

        {motivatorsLoading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-24" />)}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {motivatorOptions?.map((motivator) => {
              const isSelected = formData.motivation_factors?.includes(motivator.key);
              
              return (
                <Badge
                  key={motivator.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 text-sm"
                  onClick={() => handleMotivationFactorToggle(motivator.key)}
                >
                  {motivator.label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}