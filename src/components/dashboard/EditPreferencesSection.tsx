import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  MapPin, 
  Clock, 
  Calendar, 
  DollarSign, 
  Users, 
  Heart,
  CheckCircle,
  Save
} from "lucide-react";

interface EditPreferencesSectionProps {
  profile: any;
}

const goalOptions = [
  { id: "weight_loss", label: "Weight Loss" },
  { id: "strength_training", label: "Strength Training" },
  { id: "fitness_health", label: "General Fitness & Health" },
  { id: "energy_confidence", label: "Energy & Confidence" },
  { id: "injury_prevention", label: "Injury Prevention" },
  { id: "specific_sport", label: "Sport-Specific Training" },
];

const coachingStyles = [
  { id: "tough_love", label: "Tough Love", description: "Direct, challenging approach" },
  { id: "encouraging", label: "Encouraging", description: "Supportive, motivational style" },
  { id: "structured", label: "Structured", description: "Organized, systematic approach" },
  { id: "flexible", label: "Flexible", description: "Adaptable, personalized style" },
];

const timeSlots = [
  "Early Morning (6-9 AM)",
  "Morning (9-12 PM)",
  "Afternoon (12-3 PM)",
  "Late Afternoon (3-6 PM)",
  "Evening (6-9 PM)",
  "Weekend Mornings",
  "Weekend Afternoons"
];

const personalityTypes = [
  "Self-motivated",
  "Needs accountability",
  "Beginner-friendly",
  "Routine-driven",
  "Goal-oriented",
  "Social learner"
];

export function EditPreferencesSection({ profile }: EditPreferencesSectionProps) {
  const { updateProfile } = useProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    primary_goals: profile.primary_goals || [],
    preferred_coaching_style: profile.preferred_coaching_style || [],
    preferred_time_slots: profile.preferred_time_slots || [],
    training_location_preference: profile.training_location_preference || 'hybrid',
    preferred_training_frequency: profile.preferred_training_frequency || 3,
    start_timeline: profile.start_timeline || 'flexible',
    preferred_package_type: profile.preferred_package_type || 'ongoing',
    budget_range_min: profile.budget_range_min || 0,
    budget_range_max: profile.budget_range_max || 200,
    waitlist_preference: profile.waitlist_preference || 'quality_over_speed',
    client_personality_type: profile.client_personality_type || [],
    flexible_scheduling: profile.flexible_scheduling ?? true
  });

  const handleGoalToggle = (goalId: string) => {
    setPreferences(prev => ({
      ...prev,
      primary_goals: prev.primary_goals.includes(goalId)
        ? prev.primary_goals.filter((id: string) => id !== goalId)
        : [...prev.primary_goals, goalId]
    }));
  };

  const handleCoachingStyleToggle = (styleId: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_coaching_style: prev.preferred_coaching_style.includes(styleId)
        ? prev.preferred_coaching_style.filter((id: string) => id !== styleId)
        : [...prev.preferred_coaching_style, styleId]
    }));
  };

  const handleTimeSlotToggle = (slot: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_time_slots: prev.preferred_time_slots.includes(slot)
        ? prev.preferred_time_slots.filter((s: string) => s !== slot)
        : [...prev.preferred_time_slots, slot]
    }));
  };

  const handlePersonalityToggle = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      client_personality_type: prev.client_personality_type.includes(type)
        ? prev.client_personality_type.filter((t: string) => t !== type)
        : [...prev.client_personality_type, type]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await updateProfile(preferences as any);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update preferences. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Preferences Updated",
          description: "Your preferences have been saved and will improve your matches.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Edit Your Preferences</h1>
        <p className="text-muted-foreground">
          Update your training goals, personality fit, and preferences to improve your coach matches.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Goals Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Training Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map((goal) => (
                  <div 
                    key={goal.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-primary/50 ${
                      preferences.primary_goals.includes(goal.id) ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={preferences.primary_goals.includes(goal.id)}
                        onChange={() => handleGoalToggle(goal.id)}
                      />
                      <Label className="font-medium cursor-pointer">{goal.label}</Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Coaching Style */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Preferred Coaching Style
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coachingStyles.map((style) => (
                  <div 
                    key={style.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${
                      preferences.preferred_coaching_style.includes(style.id) ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleCoachingStyleToggle(style.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={preferences.preferred_coaching_style.includes(style.id)}
                          onChange={() => handleCoachingStyleToggle(style.id)}
                        />
                        <Label className="font-medium cursor-pointer">{style.label}</Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {style.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Availability & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Slots */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Preferred Time Slots</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <Checkbox
                        checked={preferences.preferred_time_slots.includes(slot)}
                        onCheckedChange={() => handleTimeSlotToggle(slot)}
                      />
                      <Label className="text-sm cursor-pointer">{slot}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Training Frequency */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Training Frequency: {preferences.preferred_training_frequency} days/week
                </Label>
                <Slider
                  value={[preferences.preferred_training_frequency]}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, preferred_training_frequency: value[0] }))}
                  max={7}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 day</span>
                  <span>7 days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Training Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Training Location Preference</Label>
                <Select 
                  value={preferences.training_location_preference} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, training_location_preference: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Only</SelectItem>
                    <SelectItem value="in_person">In-Person Only</SelectItem>
                    <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Package Type Preference</Label>
                <Select 
                  value={preferences.preferred_package_type} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, preferred_package_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing Training</SelectItem>
                    <SelectItem value="package">Fixed Package</SelectItem>
                    <SelectItem value="accountability">Accountability Only</SelectItem>
                    <SelectItem value="transformation">Transformation Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  £{preferences.budget_range_min} - £{preferences.budget_range_max} per month
                </Label>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Minimum</Label>
                  <Slider
                    value={[preferences.budget_range_min]}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, budget_range_min: value[0] }))}
                    max={500}
                    min={0}
                    step={25}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Maximum</Label>
                  <Slider
                    value={[preferences.budget_range_max]}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, budget_range_max: value[0] }))}
                    max={500}
                    min={preferences.budget_range_min}
                    step={25}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Start Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={preferences.start_timeline} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, start_timeline: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">ASAP</SelectItem>
                  <SelectItem value="within_month">Within 1 month</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                  <SelectItem value="future">Future date</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Personality Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Personality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {personalityTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    checked={preferences.client_personality_type.includes(type)}
                    onCheckedChange={() => handlePersonalityToggle(type)}
                  />
                  <Label className="text-sm cursor-pointer">{type}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Waitlist Preference */}
          <Card>
            <CardHeader>
              <CardTitle>Waitlist Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>If ideal trainer isn't available</Label>
                <Select 
                  value={preferences.waitlist_preference} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, waitlist_preference: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">Take first available</SelectItem>
                    <SelectItem value="quality_over_speed">Wait for right fit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={preferences.flexible_scheduling}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, flexible_scheduling: checked }))}
                />
                <Label className="text-sm">Flexible with scheduling</Label>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={isLoading}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}