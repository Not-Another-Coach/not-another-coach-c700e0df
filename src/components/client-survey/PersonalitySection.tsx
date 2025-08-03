import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, BookOpen, Target, Clock, Users, Zap, Calendar, Brain } from "lucide-react";

interface PersonalitySectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const personalityTypes = [
  {
    id: "first_timer",
    label: "First-time trainer",
    icon: <BookOpen className="h-5 w-5" />,
    description: "New to working with a personal trainer"
  },
  {
    id: "self_motivated",
    label: "Self-motivated",
    icon: <Target className="h-5 w-5" />,
    description: "I push myself and stay committed"
  },
  {
    id: "needs_accountability",
    label: "Needs accountability",
    icon: <Clock className="h-5 w-5" />,
    description: "I do better with external motivation and check-ins"
  },
  {
    id: "social_person",
    label: "Social person",
    icon: <Users className="h-5 w-5" />,
    description: "I enjoy interaction and conversation during workouts"
  },
  {
    id: "results_focused",
    label: "Results-focused",
    icon: <Zap className="h-5 w-5" />,
    description: "I want to see measurable progress and outcomes"
  },
  {
    id: "routine_lover",
    label: "Routine lover",
    icon: <Calendar className="h-5 w-5" />,
    description: "I prefer structured, predictable workout plans"
  },
  {
    id: "easily_distracted",
    label: "Easily distracted",
    icon: <Brain className="h-5 w-5" />,
    description: "I benefit from variety and engaging workouts"
  },
  {
    id: "detail_oriented",
    label: "Detail-oriented",
    icon: <User className="h-5 w-5" />,
    description: "I want to understand the 'why' behind exercises"
  }
];

const experienceLevels = [
  { 
    value: "beginner", 
    label: "Beginner", 
    description: "New to fitness or returning after a long break" 
  },
  { 
    value: "intermediate", 
    label: "Intermediate", 
    description: "Some fitness experience, comfortable with basic exercises" 
  },
  { 
    value: "advanced", 
    label: "Advanced", 
    description: "Experienced with various workout styles and techniques" 
  }
];

export function PersonalitySection({ formData, updateFormData, errors, clearFieldError }: PersonalitySectionProps) {
  const handlePersonalityToggle = (personalityId: string) => {
    const current = formData.client_personality_type || [];
    const updated = current.includes(personalityId)
      ? current.filter((type: string) => type !== personalityId)
      : [...current, personalityId];
    updateFormData({ client_personality_type: updated });
    clearFieldError?.('client_personality_type');
  };

  const handleExperienceLevelChange = (level: string) => {
    updateFormData({ experience_level: level });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-muted-foreground">
          This helps us match you with trainers who work well with your personality and experience level
        </p>
      </div>

      {/* Experience Level */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">What's your fitness experience level?</Label>
          <p className="text-sm text-muted-foreground">
            This helps trainers adjust their approach to your needs
          </p>
        </div>

        <Select 
          value={formData.experience_level || "beginner"} 
          onValueChange={handleExperienceLevelChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            {experienceLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{level.label}</span>
                  <span className="text-sm text-muted-foreground">{level.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Personality Types */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">How would you describe yourself? *</Label>
          <p className="text-sm text-muted-foreground">
            Select all that apply - this helps us find trainers who match your working style
          </p>
        </div>
        
        {errors?.client_personality_type && (
          <p className="text-sm text-destructive">{errors.client_personality_type}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalityTypes.map((type) => {
            const isSelected = formData.client_personality_type?.includes(type.id);
            
            return (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handlePersonalityToggle(type.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handlePersonalityToggle(type.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-primary">{type.icon}</div>
                        <h3 className="font-medium">{type.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {(formData.experience_level || formData.client_personality_type?.length > 0) && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Your Profile</h4>
            <div className="space-y-2">
              {formData.experience_level && (
                <div>
                  <Label className="text-sm font-medium">Experience level:</Label>
                  <Badge variant="secondary" className="ml-2">
                    {experienceLevels.find(level => level.value === formData.experience_level)?.label}
                  </Badge>
                </div>
              )}
              
              {formData.client_personality_type?.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Personality traits:</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.client_personality_type.map((typeId: string) => {
                      const type = personalityTypes.find(t => t.id === typeId);
                      return type ? (
                        <Badge key={typeId} variant="outline">
                          {type.label}
                        </Badge>
                      ) : null;
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