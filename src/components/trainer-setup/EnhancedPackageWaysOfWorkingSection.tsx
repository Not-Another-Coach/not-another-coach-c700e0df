import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Copy, ArrowRight, Activity, Zap, CheckCircle, Eye, EyeOff, Package, Workflow } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { usePackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";
import { useActivitySynchronization } from "@/hooks/useActivitySynchronization";
import { ActivityPickerDialog } from "./ActivityPickerDialog";
import { toast } from "sonner";

interface PackageWaysOfWorkingSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

interface WaysOfWorkingItem {
  text: string;
  id: string;
  activityId?: string;
}

export function EnhancedPackageWaysOfWorkingSection({ formData }: PackageWaysOfWorkingSectionProps) {
  const [activePackageId, setActivePackageId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('getting-started');
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [showActivityPicker, setShowActivityPicker] = useState<{ section: string; category: string } | null>(null);
  const { packageWorkflows, loading, savePackageWorkflow, getPackageWorkflow } = usePackageWaysOfWorking();
  const { syncWaysOfWorkingToActivities, loading: syncLoading } = useActivitySynchronization();

  // Get packages from formData
  const packages = formData.package_options || [];
  
  // Set default active package and create workflow if needed
  useEffect(() => {
    if (packages.length > 0 && !activePackageId) {
      setActivePackageId(packages[0].id);
    }
  }, [packages, activePackageId]);

  // Create workflow when package is selected if it doesn't exist
  useEffect(() => {
    const createWorkflowIfNeeded = async () => {
      if (activePackageId && packages.length > 0) {
        const currentPackage = packages.find((pkg: any) => pkg.id === activePackageId);
        const existingWorkflow = getPackageWorkflow(activePackageId);
        
        if (currentPackage && !existingWorkflow) {
          try {
            await savePackageWorkflow(activePackageId, currentPackage.name, {
              visibility: 'public'
            });
          } catch (error) {
            console.error('Error creating workflow:', error);
          }
        }
      }
    };

    createWorkflowIfNeeded();
  }, [activePackageId, packages, getPackageWorkflow, savePackageWorkflow]);

  const addItem = async (section: string) => {
    if (!activePackageId || !newItems[section]?.trim()) return;

    const workflow = getPackageWorkflow(activePackageId);
    if (!workflow) return;

    const newItem = { id: `${Date.now()}`, text: newItems[section].trim() };
    const currentItems = (workflow[`${section}_items` as keyof typeof workflow] as WaysOfWorkingItem[]) || [];
    
    // Check if item already exists
    if (currentItems.some(item => item.text.toLowerCase() === newItem.text.toLowerCase())) {
      toast.error("This item already exists in the list", {
        position: "top-center",
        duration: 2000,
      });
      return;
    }

    const updatedItems = [...currentItems, newItem];
    const packageName = formData.package_options?.find((p: any) => p.id === activePackageId)?.name || 'Unknown Package';
    
    try {
      await savePackageWorkflow(activePackageId, packageName, {
        [`${section}_items`]: updatedItems
      });
      
      setNewItems(prev => ({ ...prev, [section]: '' }));
      toast.success("Item added", {
        position: "top-center",
        duration: 1500,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error("Failed to add item", {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  const removeItem = async (section: string, itemId: string) => {
    if (!activePackageId) return;

    const workflow = getPackageWorkflow(activePackageId);
    if (!workflow) return;

    const currentItems = (workflow[`${section}_items` as keyof typeof workflow] as WaysOfWorkingItem[]) || [];
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    const packageName = formData.package_options?.find((p: any) => p.id === activePackageId)?.name || 'Unknown Package';
    
    try {
      await savePackageWorkflow(activePackageId, packageName, {
        [`${section}_items`]: updatedItems
      });
      
      toast.success("Item removed", {
        position: "top-center",
        duration: 1500,
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error("Failed to remove item", {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  const addSuggestion = async (section: string, suggestion: string) => {
    if (!activePackageId || !suggestion.trim()) return;

    const workflow = getPackageWorkflow(activePackageId);
    if (!workflow) return;

    const newItem = { id: `${Date.now()}`, text: suggestion.trim() };
    const currentItems = (workflow[`${section}_items` as keyof typeof workflow] as WaysOfWorkingItem[]) || [];
    
    // Check if suggestion already exists
    if (currentItems.some(item => item.text.toLowerCase() === suggestion.trim().toLowerCase())) {
      toast.error("This item already exists in the list", {
        position: "top-center",
        duration: 2000,
      });
      return;
    }

    const updatedItems = [...currentItems, newItem];
    
    const packageName = formData.package_options?.find((p: any) => p.id === activePackageId)?.name || 'Unknown Package';
    
    try {
      await savePackageWorkflow(activePackageId, packageName, {
        [`${section}_items`]: updatedItems
      });
      
      toast.success("Added suggestion", {
        position: "top-center",
        duration: 1500,
      });
    } catch (error) {
      console.error('Error adding suggestion:', error);
      toast.error("Failed to add suggestion", {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  // Add activity from picker
  const addActivityToSection = async (section: string, activityName: string, activityId?: string) => {
    if (!activePackageId || !activityName.trim()) return;

    const workflow = getPackageWorkflow(activePackageId);
    if (!workflow) return;

    const newItem = { 
      id: activityId ? `activity-${activityId}` : `${Date.now()}`, 
      text: activityName.trim(),
      activityId: activityId || undefined
    };
    const currentItems = (workflow[`${section}_items` as keyof typeof workflow] as WaysOfWorkingItem[]) || [];
    
    // Check if item already exists
    if (currentItems.some(item => item.text.toLowerCase() === activityName.trim().toLowerCase())) {
      toast.error("This item already exists in the list", {
        position: "top-center",
        duration: 2000,
      });
      return;
    }

    const updatedItems = [...currentItems, newItem];
    const packageName = formData.package_options?.find((p: any) => p.id === activePackageId)?.name || 'Unknown Package';
    
    try {
      await savePackageWorkflow(activePackageId, packageName, {
        [`${section}_items`]: updatedItems
      });
      
      setShowActivityPicker(null);
      toast.success("Activity added", {
        position: "top-center",
        duration: 1500,
      });
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error("Failed to add activity", {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  // Sync section to activities
  const syncSectionToActivities = async (section: string) => {
    if (!activePackageId) return;

    const workflow = getPackageWorkflow(activePackageId);
    if (!workflow) return;

    const items = (workflow[`${section}_items` as keyof typeof workflow] as WaysOfWorkingItem[]) || [];
    if (items.length === 0) {
      toast.error("No items to sync in this section", {
        position: "top-center",
        duration: 2000,
      });
      return;
    }

    try {
      await syncWaysOfWorkingToActivities(activePackageId, section, items);
    } catch (error) {
      console.error('Error syncing to activities:', error);
    }
  };

  const updateVisibility = async (visibility: 'public' | 'post_match') => {
    if (!activePackageId) return;

    const workflow = getPackageWorkflow(activePackageId);
    const packageName = formData.package_options?.find((p: any) => p.id === activePackageId)?.name || 'Unknown Package';
    
    try {
      await savePackageWorkflow(activePackageId, packageName, {
        ...workflow,
        visibility
      });

      toast.success(`Visibility updated to ${visibility === 'public' ? 'public' : 'post-match only'}`, {
        position: "top-center",
        duration: 1500,
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error("Failed to update visibility", {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  const clonePackageWorkflow = async (sourcePackageId: string, targetPackageId: string, targetPackageName: string) => {
    const sourceWorkflow = getPackageWorkflow(sourcePackageId);
    if (!sourceWorkflow) return;

    const clonedWorkflow = {
      ...sourceWorkflow,
      package_id: targetPackageId,
      package_name: targetPackageName
    };
    
    await savePackageWorkflow(targetPackageId, targetPackageName, clonedWorkflow);
    
    toast.success(`Cloned settings from ${sourceWorkflow.package_name}`, {
      position: "top-center",
      duration: 2000,
    });
  };

  const renderSection = (section: string) => {
    const workflow = getPackageWorkflow(activePackageId);
    if (!workflow) return null;

    const currentItems = (workflow[`${section}_items` as keyof typeof workflow] as WaysOfWorkingItem[]) || [];
    const sectionKey = newItems[section] || '';

    // Map section to activity category
    const sectionToCategoryMap: Record<string, string> = {
      'onboarding_items': 'Onboarding',
      'first_week_items': 'First Week',
      'ongoing_structure_items': 'Ongoing Structure',
      'tracking_tools_items': 'Tracking Tools',
      'client_expectations_items': 'Client Expectations',
      'what_i_bring_items': 'What I Bring'
    };

    const category = sectionToCategoryMap[section] || 'general';

    const suggestions = [
      'Weekly check-in calls',
      'Progress photos and measurements',
      'Food diary tracking',
      'Workout video reviews',
      'Goal setting sessions',
      'Nutrition planning',
      'Form correction videos',
      'Motivation and accountability',
      'Custom meal plans',
      'Exercise modifications'
    ];

    return (
      <div className="space-y-4">
        {/* Section Header with Sync Button */}
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Items ({currentItems.length})</h4>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => syncSectionToActivities(section)}
              disabled={currentItems.length === 0 || syncLoading}
              className="text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Sync to Activities
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          {currentItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {(item as any).activityId && (
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                )}
                <span className="flex-1 min-w-0 truncate">{item.text}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {(item as any).activityId && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      Activity
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(section, item.id)}
                className="text-destructive hover:text-destructive flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Input Methods */}
        <div className="space-y-3">
          {/* Manual Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add new item..."
              value={sectionKey}
              onChange={(e) => setNewItems(prev => ({ ...prev, [section]: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addItem(section);
                }
              }}
            />
            <Button onClick={() => addItem(section)} disabled={!sectionKey.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Activity Picker */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowActivityPicker({ section, category })}
              className="flex-1"
            >
              <Activity className="h-4 w-4 mr-2" />
              Choose from Activity Library
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quick Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => addSuggestion(section, suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          icons={[Package, Workflow, Activity]}
          title="Enhanced Package Ways of Working"
          description="Define how you work with clients for each package with smart activity integration"
        />
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Loading package workflows...</div>
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          icons={[Package, Workflow, Activity]}
          title="Enhanced Package Ways of Working"
          description="Define how you work with clients for each package with smart activity integration"
        />
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-200">No packages configured</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  You need to set up your packages in the "Rates & Discovery Calls" section before configuring ways of working.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentWorkflow = activePackageId ? getPackageWorkflow(activePackageId) : null;

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Package, Workflow, Activity]}
        title="Enhanced Package Ways of Working"
        description="Define how you work with clients for each package with smart activity integration"
      />
      
      {/* Package Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select Package to Configure</h4>
              {packages.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const sourcePackages = packages.filter((pkg: any) => pkg.id !== activePackageId && getPackageWorkflow(pkg.id));
                    if (sourcePackages.length > 0) {
                      const sourcePackage = sourcePackages[0];
                      const currentPackage = packages.find((pkg: any) => pkg.id === activePackageId);
                      if (currentPackage) {
                        clonePackageWorkflow(sourcePackage.id, activePackageId, currentPackage.name);
                      }
                    }
                  }}
                  disabled={packages.filter((pkg: any) => pkg.id !== activePackageId && getPackageWorkflow(pkg.id)).length === 0}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Clone from another package
                </Button>
              )}
            </div>
            
            <Select value={activePackageId} onValueChange={setActivePackageId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a package to configure" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg: any) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pkg.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {pkg.currency === 'GBP' ? '£' : pkg.currency === 'USD' ? '$' : '€'}{pkg.price}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Package Workflow Configuration */}
      {activePackageId && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="getting-started"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
            >
              Getting Started
            </TabsTrigger>
            <TabsTrigger 
              value="ongoing-support"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
            >
              Ongoing Support
            </TabsTrigger>
            <TabsTrigger 
              value="expectations"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
            >
              Expectations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="getting-started" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Process</CardTitle>
                <p className="text-sm text-muted-foreground">
                  How you welcome and assess new clients for this package
                </p>
              </CardHeader>
              <CardContent>
                {renderSection("onboarding")}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>First Week Experience</CardTitle>
                <p className="text-sm text-muted-foreground">
                  What clients can expect in their first week with this package
                </p>
              </CardHeader>
              <CardContent>
                {renderSection("first_week")}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ongoing-support" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ongoing Structure</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Regular coaching rhythm and touchpoints for this package
                </p>
              </CardHeader>
              <CardContent>
                {renderSection("ongoing_structure")}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tracking & Progress Tools</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tools and methods you use to track progress for this package
                </p>
              </CardHeader>
              <CardContent>
                {renderSection("tracking_tools")}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>What I Bring</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your unique value and approach for this package
                </p>
              </CardHeader>
              <CardContent>
                {renderSection("what_i_bring")}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expectations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>What I Expect From Clients</CardTitle>
                <p className="text-sm text-muted-foreground">
                  What you need from clients for this package to succeed
                </p>
              </CardHeader>
              <CardContent>
                {renderSection("client_expectations")}
              </CardContent>
            </Card>
            
            {/* Visibility Setting */}
            <Card>
              <CardHeader>
                <CardTitle>Visibility Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Control when clients can see these details
                </p>
              </CardHeader>
              <CardContent>
                <Select
                  value={currentWorkflow?.visibility || "public"}
                  onValueChange={(value: 'public' | 'post_match') => updateVisibility(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>Show on my profile</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="post_match">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        <span>Show only after match</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Activity Picker Dialog */}
      <ActivityPickerDialog
        open={!!showActivityPicker}
        onOpenChange={(open) => !open && setShowActivityPicker(null)}
        onSelectActivity={(activityName, activityId) => {
          if (showActivityPicker) {
            addActivityToSection(showActivityPicker.section, activityName, activityId);
          }
        }}
        categoryFilter={showActivityPicker?.category}
        title={`Add Activity to ${showActivityPicker?.category || 'Section'}`}
      />
    </div>
  );
}