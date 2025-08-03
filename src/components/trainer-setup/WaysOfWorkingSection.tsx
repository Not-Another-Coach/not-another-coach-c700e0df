import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Eye, EyeOff, Info } from "lucide-react";

interface WaysOfWorkingSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

interface WaysOfWorkingItem {
  text: string;
  id: string;
}

export function WaysOfWorkingSection({ formData, updateFormData, errors = {}, clearFieldError }: WaysOfWorkingSectionProps) {
  const [newItems, setNewItems] = useState<{ [key: string]: string }>({
    onboarding: "",
    first_week: "",
    ongoing_structure: "",
    tracking_tools: "",
    client_expectations: "",
    what_i_bring: ""
  });

  // Common suggestions for each section
  const suggestions = {
    onboarding: [
      "Free 15-min discovery call",
      "Comprehensive health questionnaire",
      "Goals & lifestyle assessment",
      "Starting photos & measurements",
      "Movement assessment session",
      "Nutrition preferences discussion"
    ],
    first_week: [
      "Welcome package sent via app",
      "Personalized training plan delivered by Day 2",
      "First live session scheduled",
      "Nutrition guidelines provided",
      "Check-in call within 48 hours",
      "App setup & walkthrough"
    ],
    ongoing_structure: [
      "Weekly video check-ins",
      "Bi-weekly live sessions",
      "Monthly goal reviews",
      "Daily messaging support Mon-Fri",
      "Flexible session rescheduling",
      "Quarterly progress assessments"
    ],
    tracking_tools: [
      "Before/after photos",
      "Body measurements tracking",
      "Food journal reviews",
      "Workout completion logs",
      "Progress photos monthly",
      "Performance metrics tracking"
    ],
    client_expectations: [
      "Weekly honest feedback",
      "Consistent communication",
      "Openness to try new routines",
      "Photo/measurement updates",
      "Active participation in sessions",
      "Regular check-in responses"
    ],
    what_i_bring: [
      "Personalized training programs",
      "Ongoing motivation & support",
      "Flexible scheduling options",
      "Evidence-based approaches",
      "Adaptation to your lifestyle",
      "Realistic goal setting"
    ]
  };

  const sectionTitles = {
    onboarding: "Onboarding Process",
    first_week: "First Week Experience",
    ongoing_structure: "Ongoing Structure",
    tracking_tools: "Tracking & Progress Tools",
    client_expectations: "What I Expect From Clients",
    what_i_bring: "What I Bring"
  };

  const sectionDescriptions = {
    onboarding: "How you welcome and assess new clients",
    first_week: "What clients can expect in their first week",
    ongoing_structure: "Your regular coaching rhythm and touchpoints",
    tracking_tools: "Tools and methods you use to track progress",
    client_expectations: "What you need from clients for success",
    what_i_bring: "Your unique value and approach"
  };

  const addItem = (section: string) => {
    const text = newItems[section]?.trim();
    if (!text) return;

    const currentItems = formData[`ways_of_working_${section}`] || [];
    const newItem: WaysOfWorkingItem = {
      id: Date.now().toString(),
      text: text
    };

    updateFormData({
      [`ways_of_working_${section}`]: [...currentItems, newItem]
    });

    setNewItems(prev => ({ ...prev, [section]: "" }));
  };

  const removeItem = (section: string, itemId: string) => {
    const currentItems = formData[`ways_of_working_${section}`] || [];
    const updatedItems = currentItems.filter((item: WaysOfWorkingItem) => item.id !== itemId);
    updateFormData({
      [`ways_of_working_${section}`]: updatedItems
    });
  };

  const addSuggestion = (section: string, suggestion: string) => {
    const currentItems = formData[`ways_of_working_${section}`] || [];
    const newItem: WaysOfWorkingItem = {
      id: Date.now().toString(),
      text: suggestion
    };

    updateFormData({
      [`ways_of_working_${section}`]: [...currentItems, newItem]
    });
  };

  const renderSection = (section: string) => {
    const items = formData[`ways_of_working_${section}`] || [];
    const sectionSuggestions = suggestions[section as keyof typeof suggestions];

    return (
      <Card key={section} className="space-y-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{sectionTitles[section as keyof typeof sectionTitles]}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {sectionDescriptions[section as keyof typeof sectionDescriptions]}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current items */}
          {items.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current items:</Label>
              <div className="space-y-2">
                {items.map((item: WaysOfWorkingItem) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">{item.text}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(section, item.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add new item */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Add new item:</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder={`Describe your ${sectionTitles[section as keyof typeof sectionTitles].toLowerCase()}...`}
                value={newItems[section] || ""}
                onChange={(e) => setNewItems(prev => ({ ...prev, [section]: e.target.value }))}
                className="min-h-[60px] resize-none"
                rows={2}
              />
              <Button
                onClick={() => addItem(section)}
                disabled={!newItems[section]?.trim()}
                size="sm"
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick suggestions:</Label>
            <div className="flex flex-wrap gap-2">
              {sectionSuggestions.map((suggestion, index) => {
                const isAdded = items.some((item: WaysOfWorkingItem) => item.text === suggestion);
                return (
                  <Badge
                    key={index}
                    variant={isAdded ? "secondary" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isAdded 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-primary hover:text-primary-foreground"
                    }`}
                    onClick={() => !isAdded && addSuggestion(section, suggestion)}
                  >
                    {suggestion}
                    {isAdded && <span className="ml-1">✓</span>}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Introduction */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h3 className="font-medium text-primary">Ways of Working / Client Journey</h3>
              <p className="text-sm text-muted-foreground">
                Help clients understand your process and set clear expectations. This builds trust and filters for ideal-fit clients.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility Setting */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Visibility Setting</Label>
            <Select
              value={formData.ways_of_working_visibility || "public"}
              onValueChange={(value) => updateFormData({ ways_of_working_visibility: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Public - Visible on my profile</span>
                  </div>
                </SelectItem>
                <SelectItem value="post_match">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <span>Post-Match Only - Visible after matching</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose when clients can see your working style details
            </p>
          </div>
        </CardContent>
      </Card>

      {/* All sections */}
      <div className="space-y-6">
        {Object.keys(sectionTitles).map(section => renderSection(section))}
      </div>

      {/* Completion Status */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ways_of_working_completed"
              checked={formData.ways_of_working_completed || false}
              onChange={(e) => updateFormData({ ways_of_working_completed: e.target.checked })}
              className="rounded border-green-300"
            />
            <Label htmlFor="ways_of_working_completed" className="text-sm">
              I've completed setting up my ways of working
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}