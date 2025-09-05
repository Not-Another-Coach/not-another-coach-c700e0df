import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Settings, Info } from "lucide-react";
import { useTrainerActivities } from "@/hooks/useTrainerActivities";
import { useProfileStepValidation } from "@/hooks/useProfileStepValidation";
import { usePackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";
import { SectionHeader } from "./SectionHeader";
import { EnhancedActivityPickerDialog } from "./EnhancedActivityPickerDialog";
import { ActivityWithAssignment } from "./ActivityWithAssignment";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

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
  const { checkWaysOfWorkingPrerequisites } = useProfileStepValidation();
  const { savePackageWorkflow } = usePackageWaysOfWorking();
  const [activePickerSection, setActivePickerSection] = useState<string | null>(null);
  
  // Get packages from formData with fallback to fetch from database
  const [availablePackages, setAvailablePackages] = useState(formData.package_options || []);
  
  // Keep packages in sync with formData changes (including deletions)
  useEffect(() => {
    if (formData.package_options) {
      setAvailablePackages(formData.package_options);
    }
  }, [formData.package_options]);
  
  useEffect(() => {
    const fetchPackagesIfNeeded = async () => {
      if (!formData.package_options || formData.package_options.length === 0) {
        try {
          const { data: trainerData } = await supabase
            .from('trainer_profiles')
            .select('package_options')
            .eq('id', formData.id || '')
            .single();
          
          if (trainerData?.package_options) {
            setAvailablePackages(trainerData.package_options);
            updateFormData({ package_options: trainerData.package_options });
          }
        } catch (error) {
          console.error('Error fetching packages:', error);
        }
      } else {
        setAvailablePackages(formData.package_options);
      }
    };
    
    fetchPackagesIfNeeded();
  }, [formData.package_options, formData.id]);
  
  // Check if prerequisites are met for enabling the completion checkbox
  const prerequisitesMet = useMemo(() => {
    return checkWaysOfWorkingPrerequisites(formData);
  }, [formData, checkWaysOfWorkingPrerequisites]);
  
  // Get missing requirements for tooltip
  const getMissingRequirements = (): string[] => {
    const missing: string[] = [];
    
    // Only check for activities - remove text field requirements
    const activities = formData.wow_activities;
    const hasActivities = activities && typeof activities === 'object' &&
      ['wow_how_i_work', 'wow_what_i_provide', 'wow_client_expectations'].some(section => 
        Array.isArray(activities[section]) && activities[section].length > 0
      );
    
    if (!hasActivities) {
      missing.push('At least one activity selected');
    }
    
    // Force console log on every render
    console.log('=== WoW Requirements Check ===');
    console.log('Has activities:', hasActivities);
    console.log('Activities object:', formData.wow_activities);
    console.log('Missing requirements:', missing);
    console.log('Prerequisites met:', missing.length === 0);
    console.log('Form data keys:', Object.keys(formData));
    
    return missing;
  };

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
      
      // Sync to package table after a short delay to allow form update to complete
      setTimeout(() => syncToPackageTable(), 100);
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
    
    // Sync to package table after removal
    setTimeout(() => syncToPackageTable(), 100);
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
    
    // Sync to package_ways_of_working table
    syncToPackageTable();
  };

  // Sync data to package_ways_of_working table
  const syncToPackageTable = async () => {
    const packages = formData.package_options || [];
    const activitiesData = getActivitiesData();
    const assignments = getAssignmentsData();
    
    // For each package, create/update package ways of working
    for (const pkg of packages) {
      if (!pkg.id || !pkg.name) continue;
      
      try {
        // Map activities by section to the package format
        const packageData = {
          onboarding_items: activitiesData.wow_how_i_work?.map((activity: SelectedActivity) => ({
            id: activity.id || crypto.randomUUID(),
            text: activity.name
          })) || [],
          first_week_items: activitiesData.wow_what_i_provide?.map((activity: SelectedActivity) => ({
            id: activity.id || crypto.randomUUID(),
            text: activity.name
          })) || [],
          client_expectations_items: activitiesData.wow_client_expectations?.map((activity: SelectedActivity) => ({
            id: activity.id || crypto.randomUUID(),
            text: activity.name
          })) || [],
          ongoing_structure_items: [],
          tracking_tools_items: [],
          what_i_bring_items: [],
          visibility: (formData.wow_visibility || 'public') as 'public' | 'post_match'
        };
        
        await savePackageWorkflow(pkg.id, pkg.name, packageData);
      } catch (error) {
        console.error('Error syncing package ways of working:', error);
      }
    }
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
          
          {availablePackages.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4 p-3 bg-secondary/50 rounded-md">
              No packages found. Please create packages in the Rates & Packages section first to enable package-specific Ways of Working assignment.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Completion Checkbox */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wow_setup_completed"
                      checked={formData.wow_setup_completed || false}
                      disabled={!prerequisitesMet}
                      onCheckedChange={(checked) => {
                        if (prerequisitesMet) {
                          updateFormData({ wow_setup_completed: checked });
                        }
                      }}
                    />
                     <label
                       htmlFor="wow_setup_completed"
                       className={`text-sm font-medium leading-none cursor-pointer ${
                         !prerequisitesMet ? 'opacity-50 cursor-not-allowed' : ''
                       }`}
                     >
                       Ways of Working setup completed
                     </label>
                     <Badge variant={prerequisitesMet ? "default" : "secondary"} className="text-xs ml-2">
                       {prerequisitesMet ? "✓ Ready" : `Need: ${getMissingRequirements().join(", ")}`}
                     </Badge>
                    {!prerequisitesMet && (
                      <Info className="h-4 w-4 text-muted-foreground ml-1" />
                    )}
                  </div>
                </TooltipTrigger>
                {!prerequisitesMet && (
                  <TooltipContent>
                    <div className="max-w-sm">
                      <p className="mb-2 font-medium">Complete the following to enable:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {getMissingRequirements().map((requirement, index) => (
                          <li key={index}>{requirement}</li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          {!prerequisitesMet && (
            <p className="text-sm text-muted-foreground mt-2">
              Complete all required fields above to mark this section as finished.
            </p>
          )}
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