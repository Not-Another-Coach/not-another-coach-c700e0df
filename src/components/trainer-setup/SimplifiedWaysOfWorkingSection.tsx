import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Settings } from "lucide-react";
import { useTrainerActivities } from "@/hooks/useTrainerActivities";
import { SectionHeader } from "./SectionHeader";
import { EnhancedActivityPickerDialog } from "./EnhancedActivityPickerDialog";
import { ActivityWithAssignment } from "./ActivityWithAssignment";

interface SelectedActivity {
  id?: string;
  name: string;
  category: string;
  isCustom: boolean;
}

interface ActivityPackageAssignment {
  activityName: string;
  assignedTo: 'all' | 'specific';
  packageIds: string[];
}

interface SimplifiedWaysOfWorkingSectionProps {
  formData: any;
  updateFormData: (updates: Partial<any>) => void;
  errors: Record<string, string>;
  clearFieldError: (field: string) => void;
}

export function SimplifiedWaysOfWorkingSection({
  formData,
  updateFormData,
  errors,
  clearFieldError,
}: SimplifiedWaysOfWorkingSectionProps) {
  const { getSuggestionsBySection } = useTrainerActivities();
  const [activePickerSection, setActivePickerSection] = useState<string | null>(null);

  // Section configuration - using actual database categories
  const sections = [
    {
      key: "wow_how_i_work",
      title: "How I Work",
      description: "Describe your coaching approach and methodology",
      placeholder: "Activities selected above will appear here as a summary...",
      suggestionCategories: ["coaching_style", "methodology", "approach"]
    },
    {
      key: "wow_what_i_provide", 
      title: "What I Provide",
      description: "Detail the services and support you offer to clients",
      placeholder: "Activities selected above will appear here as a summary...",
      suggestionCategories: ["services", "support", "tracking"]
    },
    {
      key: "wow_client_expectations",
      title: "Client Expectations", 
      description: "Set clear expectations for client commitment and behavior",
      placeholder: "Activities selected above will appear here as a summary...",
      suggestionCategories: ["expectations", "requirements", "commitment"]
    }
  ];

  // Get current activities data
  const getActivitiesData = () => {
    return formData.wow_activities || {
      wow_how_i_work: [],
      wow_what_i_provide: [],
      wow_client_expectations: []
    };
  };

  // Get current assignments data
  const getAssignmentsData = () => {
    return formData.wow_activity_assignments || [];
  };

  // Handle activity selection
  const handleActivitySelect = (sectionKey: string, activity: SelectedActivity) => {
    const activitiesData = getActivitiesData();
    const currentActivities = activitiesData[sectionKey] || [];
    
    const isDuplicate = currentActivities.some((existing: SelectedActivity) => 
      existing.name.toLowerCase() === activity.name.toLowerCase()
    );
    
    if (!isDuplicate) {
      const newActivities = [...currentActivities, activity];
      const newActivitiesData = {
        ...activitiesData,
        [sectionKey]: newActivities
      };
      
      updateFormData({ wow_activities: newActivitiesData });
      updateSummaryText(sectionKey, newActivities);
      clearFieldError(sectionKey);
    }
  };

  // Handle activity removal
  const handleActivityRemove = (sectionKey: string, activityName: string) => {
    const activitiesData = getActivitiesData();
    const currentActivities = activitiesData[sectionKey] || [];
    const newActivities = currentActivities.filter((activity: SelectedActivity) => 
      activity.name !== activityName
    );
    
    const newActivitiesData = {
      ...activitiesData,
      [sectionKey]: newActivities
    };
    
    updateFormData({ wow_activities: newActivitiesData });
    updateSummaryText(sectionKey, newActivities);
  };

  // Update summary text based on selected activities
  const updateSummaryText = (sectionKey: string, activities: SelectedActivity[]) => {
    if (activities.length === 0) {
      updateFormData({ [sectionKey]: "" });
      return;
    }
    
    const summary = activities.map(activity => `• ${activity.name}`).join('\n');
    updateFormData({ [sectionKey]: summary });
  };

  // Handle package assignment changes
  const handleAssignmentChange = (activityName: string, assignment: ActivityPackageAssignment) => {
    const currentAssignments = getAssignmentsData();
    const newAssignments = currentAssignments.filter((a: ActivityPackageAssignment) => 
      a.activityName !== activityName
    );
    newAssignments.push(assignment);
    updateFormData({ wow_activity_assignments: newAssignments });
  };

  // Get assignment for a specific activity
  const getAssignment = (activityName: string): ActivityPackageAssignment => {
    const assignments = getAssignmentsData();
    return assignments.find((a: ActivityPackageAssignment) => a.activityName === activityName) || {
      activityName,
      assignedTo: 'all',
      packageIds: []
    };
  };

  // Get all selected activities across all sections
  const getAllSelectedActivities = (): SelectedActivity[] => {
    const activitiesData = getActivitiesData();
    return [
      ...(activitiesData.wow_how_i_work || []),
      ...(activitiesData.wow_what_i_provide || []),
      ...(activitiesData.wow_client_expectations || [])
    ];
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Settings]}
        title="Ways of Working" 
        description="Select activities for each section to define your working style"
      />
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">
                Select from suggested activities or create custom ones for each section. 
                Then configure which packages each activity applies to.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ways of Working Sections */}
      {sections.map((section) => {
        const activitiesData = getActivitiesData();
        const sectionActivities = activitiesData[section.key] || [];
        
        return (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {section.title}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePickerSection(section.key)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activities
                </Button>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Activities with Package Assignment */}
              {sectionActivities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected Activities:</p>
                  <div className="space-y-2">
                    {sectionActivities.map((activity: SelectedActivity, index: number) => (
                      <ActivityWithAssignment
                        key={index}
                        activity={activity}
                        assignment={getAssignment(activity.name)}
                        packageOptions={formData.package_options || []}
                        onAssignmentChange={(assignment) => handleAssignmentChange(activity.name, assignment)}
                        onRemove={() => handleActivityRemove(section.key, activity.name)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Auto-generated Summary */}
              <Textarea
                placeholder={section.placeholder}
                value={formData[section.key] || ""}
                onChange={(e) => {
                  updateFormData({ [section.key]: e.target.value });
                  clearFieldError(section.key);
                }}
                className={`min-h-[120px] ${errors[section.key] ? 'border-destructive' : ''}`}
                disabled={sectionActivities.length > 0}
              />
              
              {sectionActivities.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No activities selected. Click "Add Activities" to get started.
                </p>
              )}
              
              {errors[section.key] && (
                <p className="text-sm text-destructive">{errors[section.key]}</p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Assignment Summary */}
      {getAllSelectedActivities().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Assignment Summary
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Review how your activities are assigned across packages
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {sections.map(section => {
                const activities = getActivitiesData()[section.key] || [];
                if (activities.length === 0) return null;
                
                return (
                  <div key={section.key}>
                    <span className="font-medium">{section.title}:</span>
                    <span className="ml-2 text-muted-foreground">
                      {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visibility Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visibility</CardTitle>
          <p className="text-sm text-muted-foreground">
            Control when clients can see this information
          </p>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.wow_visibility || "public"}
            onValueChange={(value) => updateFormData({ wow_visibility: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public (visible during matching)</SelectItem>
              <SelectItem value="post_match">Post-match only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Completion Checkbox */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wow_setup_completed"
              checked={formData.wow_setup_completed || false}
              onCheckedChange={(checked) => updateFormData({ wow_setup_completed: checked })}
            />
            <label
              htmlFor="wow_setup_completed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Ways of Working setup completed
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Activity Picker Dialog */}
      <EnhancedActivityPickerDialog
        open={activePickerSection !== null}
        onOpenChange={(open) => !open && setActivePickerSection(null)}
        selectedActivities={activePickerSection ? (getActivitiesData()[activePickerSection] || []) : []}
        onSelectActivity={(activity) => {
          if (activePickerSection) {
            handleActivitySelect(activePickerSection, activity);
          }
        }}
        categoryFilter={activePickerSection ? sections.find(s => s.key === activePickerSection)?.suggestionCategories : undefined}
        title={activePickerSection ? `Add Activities - ${sections.find(s => s.key === activePickerSection)?.title}` : "Select Activities"}
        sectionKey={activePickerSection || ""}
      />
    </div>
  );
}