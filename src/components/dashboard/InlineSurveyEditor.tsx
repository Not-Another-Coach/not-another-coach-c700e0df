import { useState, useEffect } from "react";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Save, CheckCircle, Edit } from "lucide-react";

interface InlineSurveyEditorProps {
  profile: any;
}

export function InlineSurveyEditor({ profile }: InlineSurveyEditorProps) {
  const { updateProfile } = useClientProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    primary_goals: [] as string[],
    training_location_preference: "hybrid" as "in-person" | "online" | "hybrid",
    preferred_training_frequency: null as number | null,
    preferred_coaching_style: [] as string[],
    experience_level: "beginner" as "beginner" | "intermediate" | "advanced",
    budget_range_min: null as number | null,
    budget_range_max: null as number | null,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        primary_goals: (profile as any).primary_goals || [],
        training_location_preference: (profile as any).training_location_preference || "hybrid",
        preferred_training_frequency: (profile as any).preferred_training_frequency || null,
        preferred_coaching_style: (profile as any).preferred_coaching_style || [],
        experience_level: (profile as any).experience_level || "beginner",
        budget_range_min: (profile as any).budget_range_min || null,
        budget_range_max: (profile as any).budget_range_max || null,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData as any);
      setIsEditing(false);
      toast({
        title: "Preferences updated",
        description: "Your training preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const goals = [
    "Weight Loss", "Muscle Building", "Strength Training", "Endurance", 
    "Flexibility", "Rehabilitation", "Sports Performance", "General Fitness"
  ];

  const coachingStyles = [
    "Motivational", "Technical", "Supportive", "Challenging", 
    "Structured", "Flexible", "Results-Focused", "Process-Focused"
  ];

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      primary_goals: prev.primary_goals.includes(goal)
        ? prev.primary_goals.filter(g => g !== goal)
        : [...prev.primary_goals, goal]
    }));
  };

  const toggleCoachingStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_coaching_style: prev.preferred_coaching_style.includes(style)
        ? prev.preferred_coaching_style.filter(s => s !== style)
        : [...prev.preferred_coaching_style, style]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Training Preferences</h1>
          <p className="text-muted-foreground">
            Update your preferences to get better trainer matches
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Cancel" : "Edit Preferences"}
        </Button>
      </div>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Your Fitness Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {goals.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.primary_goals.includes(goal)}
                    onCheckedChange={() => toggleGoal(goal)}
                  />
                  <Label htmlFor={goal} className="text-sm font-medium cursor-pointer">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.primary_goals.length > 0 ? (
                formData.primary_goals.map((goal) => (
                  <Badge key={goal} variant="default">{goal}</Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No goals selected</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Location */}
      <Card>
        <CardHeader>
          <CardTitle>Training Location Preference</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Select
              value={formData.training_location_preference}
              onValueChange={(value: "in-person" | "online" | "hybrid") => 
                setFormData(prev => ({ ...prev, training_location_preference: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-person">In-Person Only</SelectItem>
                <SelectItem value="online">Online Only</SelectItem>
                <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="capitalize">
              {formData.training_location_preference?.replace('-', ' ') || 'Not set'}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Training Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Training Frequency (sessions per week)</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Select
              value={formData.preferred_training_frequency?.toString() || ""}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, preferred_training_frequency: parseInt(value) }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 session per week</SelectItem>
                <SelectItem value="2">2 sessions per week</SelectItem>
                <SelectItem value="3">3 sessions per week</SelectItem>
                <SelectItem value="4">4 sessions per week</SelectItem>
                <SelectItem value="5">5+ sessions per week</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline">
              {formData.preferred_training_frequency 
                ? `${formData.preferred_training_frequency} sessions per week`
                : 'Not set'
              }
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Coaching Style */}
      <Card>
        <CardHeader>
          <CardTitle>Preferred Coaching Style</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {coachingStyles.map((style) => (
                <div key={style} className="flex items-center space-x-2">
                  <Checkbox
                    id={style}
                    checked={formData.preferred_coaching_style.includes(style)}
                    onCheckedChange={() => toggleCoachingStyle(style)}
                  />
                  <Label htmlFor={style} className="text-sm font-medium cursor-pointer">
                    {style}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.preferred_coaching_style.length > 0 ? (
                formData.preferred_coaching_style.map((style) => (
                  <Badge key={style} variant="default">{style}</Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No coaching style selected</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card>
        <CardHeader>
          <CardTitle>Experience Level</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Select
              value={formData.experience_level}
              onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                setFormData(prev => ({ ...prev, experience_level: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="capitalize">
              {formData.experience_level || 'Not set'}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Budget Range */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Range (per session)</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget-min">Minimum (£)</Label>
                <Input
                  id="budget-min"
                  type="number"
                  value={formData.budget_range_min || ""}
                  onChange={(e) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      budget_range_min: e.target.value ? parseInt(e.target.value) : null 
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="budget-max">Maximum (£)</Label>
                <Input
                  id="budget-max"
                  type="number"
                  value={formData.budget_range_max || ""}
                  onChange={(e) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      budget_range_max: e.target.value ? parseInt(e.target.value) : null 
                    }))
                  }
                  placeholder="100"
                />
              </div>
            </div>
          ) : (
            <Badge variant="outline">
              {formData.budget_range_min || formData.budget_range_max
                ? `£${formData.budget_range_min || 0} - £${formData.budget_range_max || '∞'}`
                : 'Not set'
              }
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      )}
    </div>
  );
}