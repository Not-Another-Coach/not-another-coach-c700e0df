import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, EyeOff, Info, Settings, Workflow } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { useTrainerActivities } from "@/hooks/useTrainerActivities";

interface SimplifiedWaysOfWorkingSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

export function SimplifiedWaysOfWorkingSection({ 
  formData, 
  updateFormData, 
  errors = {}, 
  clearFieldError 
}: SimplifiedWaysOfWorkingSectionProps) {
  const { getSuggestionsBySection } = useTrainerActivities();

  const sections = [
    {
      key: 'wow_how_i_work',
      title: 'How I Work',
      description: 'Describe your coaching approach and working style',
      placeholder: 'E.g., I provide personalized workout plans with weekly check-ins and am available via WhatsApp for quick questions...',
      suggestionCategories: ['onboarding', 'ongoing_structure']
    },
    {
      key: 'wow_what_i_provide',
      title: 'What I Provide',
      description: 'What clients can expect to receive from you',
      placeholder: 'E.g., Custom nutrition plan, weekly workout videos, progress tracking app, monthly body composition analysis...',
      suggestionCategories: ['what_i_bring', 'tracking_tools']
    },
    {
      key: 'wow_client_expectations',
      title: 'Client Expectations',
      description: 'What you need from clients for successful outcomes',
      placeholder: 'E.g., Commitment to attend all sessions, complete food diary, send weekly progress photos, communicate openly about challenges...',
      suggestionCategories: ['client_expectations', 'first_week']
    }
  ];

  const getAllSuggestionsForSection = (suggestionCategories: string[]) => {
    const allSuggestions: string[] = [];
    suggestionCategories.forEach(category => {
      const suggestions = getSuggestionsBySection(category);
      allSuggestions.push(...suggestions);
    });
    return [...new Set(allSuggestions)]; // Remove duplicates
  };

  const addSuggestionToField = (fieldKey: string, suggestion: string) => {
    const currentValue = formData[fieldKey] || '';
    const newValue = currentValue 
      ? `${currentValue}\n• ${suggestion}`
      : `• ${suggestion}`;
    
    updateFormData({ [fieldKey]: newValue });
    if (clearFieldError) clearFieldError(fieldKey);
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Settings, Workflow]}
        title="Ways of Working"
        description="Define your approach in three simple sections to set clear expectations"
      />
      
      {/* Section Introduction */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h3 className="font-medium text-primary">Simplified Setup</h3>
              <p className="text-sm text-muted-foreground">
                Complete these three sections to help clients understand your process and build trust. Use the suggestions below each section for inspiration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three Main Sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const suggestions = getAllSuggestionsForSection(section.suggestionCategories);
          
          return (
            <Card key={section.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={section.key} className="text-sm font-medium">
                    {section.title}
                  </Label>
                  <Textarea
                    id={section.key}
                    placeholder={section.placeholder}
                    value={formData[section.key] || ''}
                    onChange={(e) => {
                      updateFormData({ [section.key]: e.target.value });
                      if (clearFieldError) clearFieldError(section.key);
                    }}
                    className="min-h-[120px] resize-y"
                    rows={6}
                  />
                  {errors[section.key] && (
                    <p className="text-sm text-destructive">{errors[section.key]}</p>
                  )}
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Quick suggestions:</Label>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                          onClick={() => addSuggestionToField(section.key, suggestion)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click suggestions to add them to your description
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Package Applicability */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Apply To Packages</Label>
            <Select
              value={formData.wow_package_applicability?.apply_to || "all"}
              onValueChange={(value) => {
                const newApplicability = {
                  apply_to: value,
                  package_ids: value === "all" ? [] : formData.wow_package_applicability?.package_ids || []
                };
                updateFormData({ wow_package_applicability: newApplicability });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="specific">Specific Packages Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose whether these ways of working apply to all your packages or specific ones
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Visibility Setting */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Visibility Setting</Label>
            <Select
              value={formData.wow_visibility || "public"}
              onValueChange={(value) => updateFormData({ wow_visibility: value })}
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