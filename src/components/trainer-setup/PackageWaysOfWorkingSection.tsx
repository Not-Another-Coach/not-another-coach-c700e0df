import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Eye, EyeOff, Info, Package, AlertCircle, Settings, Workflow, Activity, Zap } from "lucide-react";
import { usePackageWaysOfWorking, PackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";
import { useActivitySynchronization } from "@/hooks/useActivitySynchronization";
import { useToast } from "@/hooks/use-toast";
import { SectionHeader } from "./SectionHeader";
import { useTrainerActivities } from "@/hooks/useTrainerActivities";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PackageWaysOfWorkingSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

interface WaysOfWorkingItem {
  text: string;
  id: string;
}

export function PackageWaysOfWorkingSection({ 
  formData, 
  updateFormData, 
  errors, 
  clearFieldError 
}: PackageWaysOfWorkingSectionProps) {
  const { user } = useAuth();
  const { packageWorkflows, loading, savePackageWorkflow, getPackageWorkflow } = usePackageWaysOfWorking();
  const { syncWaysOfWorkingToActivities, loading: syncLoading } = useActivitySynchronization();
  const { toast } = useToast();
  const [activePackageId, setActivePackageId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("onboarding");
  const [newItems, setNewItems] = useState<{ [key: string]: string }>({
    onboarding: "",
    first_week: "",
    ongoing_structure: "",
    tracking_tools: "",
    client_expectations: "",
    what_i_bring: ""
  });

  // Get packages from formData
  const packages = formData.package_options || [];
  
  // Initialize packages from database if formData is empty
  useEffect(() => {
    const initializePackages = async () => {
      if (packages.length === 0 && user?.id) {
        console.log('[WoW Debug] No packages in formData, fetching from database...');
        try {
          const { data: trainerProfile } = await supabase
            .from('trainer_profiles')
            .select('package_options')
            .eq('id', user.id)
            .single();

          if (trainerProfile?.package_options && Array.isArray(trainerProfile.package_options)) {
            console.log('[WoW Debug] Found packages in database:', trainerProfile.package_options.length);
            updateFormData({ package_options: trainerProfile.package_options });
          }
        } catch (error) {
          console.error('[WoW Debug] Error fetching packages from database:', error);
        }
      }
    };

    initializePackages();
  }, [packages.length, user?.id, updateFormData]);

  // Debug logging to track package availability
  useEffect(() => {
    console.log('[WoW Debug] Packages available:', packages.map((p: any) => ({ id: p.id, name: p.name })));
    console.log('[WoW Debug] Active package ID:', activePackageId);
    console.log('[WoW Debug] All package workflows:', packageWorkflows);
  }, [packages, activePackageId, packageWorkflows]);
  
  // Set default active package and switch to newly created packages
  useEffect(() => {
    if (packages.length > 0) {
      // If no active package or the active package no longer exists, set to first package
      if (!activePackageId || !packages.find((pkg: any) => pkg.id === activePackageId)) {
        const newActiveId = packages[packages.length - 1].id; // Show the newest package (last in array)
        console.log('[WoW Debug] Setting active package to:', newActiveId, packages[packages.length - 1].name);
        setActivePackageId(newActiveId);
      }
    } else {
      console.log('[WoW Debug] No packages available in formData');
    }
  }, [packages, activePackageId]);

  // Get current package workflow
  const currentWorkflow = activePackageId ? getPackageWorkflow(activePackageId) : null;
  const currentPackage = packages.find((pkg: any) => pkg.id === activePackageId);

  // Create workflow when package is selected if it doesn't exist
  useEffect(() => {
    const createWorkflowIfNeeded = async () => {
      if (activePackageId && packages.length > 0) {
        const packageForWorkflow = packages.find((pkg: any) => pkg.id === activePackageId);
        const existingWorkflow = getPackageWorkflow(activePackageId);
        
        console.log('[WoW Debug] Current package:', packageForWorkflow?.name);
        console.log('[WoW Debug] Existing workflow:', existingWorkflow ? 'Found' : 'Not found');
        console.log('[WoW Debug] Current workflow content:', existingWorkflow);
        
        if (packageForWorkflow && !existingWorkflow) {
          try {
            console.log('[WoW Debug] Creating workflow for package:', packageForWorkflow.name);
            
            // Pre-populate with activities from general Ways of Working if available
            const initialWorkflow: any = {
              visibility: 'public',
              onboarding_items: [],
              first_week_items: [],
              ongoing_structure_items: [],
              tracking_tools_items: [],
              client_expectations_items: [],
              what_i_bring_items: []
            };

            // Check if we should copy from general WoW activities
            if (formData.wow_activities && typeof formData.wow_activities === 'object') {
              const activities = formData.wow_activities;
              
              // Map general activities to package-specific sections
              if (activities.wow_what_i_provide && Array.isArray(activities.wow_what_i_provide)) {
                initialWorkflow.what_i_bring_items = activities.wow_what_i_provide.map((activity: any) => ({
                  id: activity.id || crypto.randomUUID(),
                  text: activity.name || activity.text || ''
                }));
                console.log('[WoW Debug] Pre-populated what_i_bring with:', initialWorkflow.what_i_bring_items);
              }
              
              if (activities.wow_client_expectations && Array.isArray(activities.wow_client_expectations)) {
                initialWorkflow.client_expectations_items = activities.wow_client_expectations.map((activity: any) => ({
                  id: activity.id || crypto.randomUUID(),
                  text: activity.name || activity.text || ''
                }));
                console.log('[WoW Debug] Pre-populated client_expectations with:', initialWorkflow.client_expectations_items);
              }
            }
            
            await savePackageWorkflow(activePackageId, packageForWorkflow.name, initialWorkflow);
          } catch (error) {
            console.error('Error creating workflow:', error);
          }
        }
      }
    };

    createWorkflowIfNeeded();
  }, [activePackageId, packages, getPackageWorkflow, savePackageWorkflow, formData.wow_activities]);

  const { getSuggestionsBySection } = useTrainerActivities();

  const sectionTitles = {
    onboarding: "Onboarding Process",
    first_week: "First Week Experience",
    ongoing_structure: "Ongoing Structure",
    tracking_tools: "Tracking & Progress Tools",
    client_expectations: "What I Expect From Clients",
    what_i_bring: "What I Bring"
  };

  const sectionDescriptions = {
    onboarding: "How you welcome and assess new clients for this package",
    first_week: "What clients can expect in their first week with this package",
    ongoing_structure: "Regular coaching rhythm and touchpoints for this package",
    tracking_tools: "Tools and methods you use to track progress for this package",
    client_expectations: "What you need from clients for this package to succeed",
    what_i_bring: "Your unique value and approach for this package"
  };

  const addItem = async (section: string) => {
    const text = newItems[section];
    if (!text.trim() || !activePackageId || !currentPackage) return;

    const newItem: WaysOfWorkingItem = {
      id: crypto.randomUUID(),
      text: text.trim()
    };

    const existingItems = currentWorkflow?.[`${section}_items` as keyof PackageWaysOfWorking] as WaysOfWorkingItem[] || [];
    
    try {
      await savePackageWorkflow(activePackageId, currentPackage.name, {
        ...currentWorkflow,
        [`${section}_items`]: [...existingItems, newItem]
      });

      // Sync to activities
      await syncWaysOfWorkingToActivities(
        activePackageId, 
        section, 
        [...existingItems, newItem]
      );

      setNewItems(prev => ({ ...prev, [section]: "" }));

      toast({
        title: "Item added",
        description: "Successfully added to ways of working",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (section: string, itemId: string) => {
    if (!activePackageId || !currentPackage) return;

    const existingItems = currentWorkflow?.[`${section}_items` as keyof PackageWaysOfWorking] as WaysOfWorkingItem[] || [];
    const updatedItems = existingItems.filter(item => item.id !== itemId);

    try {
      await savePackageWorkflow(activePackageId, currentPackage.name, {
        ...currentWorkflow,
        [`${section}_items`]: updatedItems
      });

      // Sync to activities
      await syncWaysOfWorkingToActivities(
        activePackageId, 
        section, 
        updatedItems
      );

      toast({
        title: "Item removed",
        description: "Successfully removed from ways of working",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addSuggestion = async (section: string, suggestion: string) => {
    if (!activePackageId || !currentPackage) return;

    const newItem: WaysOfWorkingItem = {
      id: crypto.randomUUID(),
      text: suggestion
    };

    const existingItems = currentWorkflow?.[`${section}_items` as keyof PackageWaysOfWorking] as WaysOfWorkingItem[] || [];
    
    try {
      await savePackageWorkflow(activePackageId, currentPackage.name, {
        ...currentWorkflow,
        [`${section}_items`]: [...existingItems, newItem]
      });

      // Sync to activities
      await syncWaysOfWorkingToActivities(
        activePackageId, 
        section, 
        [...existingItems, newItem]
      );

      toast({
        title: "Suggestion added",
        description: "Added to your ways of working",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add suggestion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const syncSectionToActivities = async (section: string) => {
    if (!activePackageId) return;
    
    const items = currentWorkflow?.[`${section}_items` as keyof PackageWaysOfWorking] as WaysOfWorkingItem[] || [];

    try {
      await syncWaysOfWorkingToActivities(activePackageId, section, items);
      
      toast({
        title: "Synced to activities",
        description: `${items.length} items synced to your activities library`,
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync section to activities. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateVisibility = async (visibility: 'public' | 'post_match') => {
    if (!activePackageId || !currentPackage) return;

    try {
      await savePackageWorkflow(activePackageId, currentPackage.name, {
        ...currentWorkflow,
        visibility
      });

      toast({
        title: "Visibility updated",
        description: `Package workflow is now ${visibility === 'public' ? 'public' : 'post-match only'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility. Please try again.",
        variant: "destructive",
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
    
    toast({
      title: "Ways of working cloned",
      description: `Copied settings from ${sourceWorkflow.package_name}`,
    });
  };

  const renderSection = (section: string) => {
    if (!currentWorkflow) return null;
    
    const items = currentWorkflow[`${section}_items` as keyof PackageWaysOfWorking] as WaysOfWorkingItem[] || [];
    const sectionSuggestions = getSuggestionsBySection(section);

    return (
      <Card key={section} className="space-y-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {sectionTitles[section as keyof typeof sectionTitles]}
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {sectionDescriptions[section as keyof typeof sectionDescriptions]}
              </p>
            </div>
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncSectionToActivities(section)}
                disabled={syncLoading}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Sync to Activities
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current items */}
          {items.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current items:</Label>
              <div className="space-y-2">
                {items.map((item: WaysOfWorkingItem) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">{item.text}</span>
                      <Badge variant="outline" className="text-xs">
                        <Activity className="h-3 w-3 mr-1" />
                        Activity
                      </Badge>
                    </div>
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
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add new item:</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder={`Describe what you do for ${sectionTitles[section as keyof typeof sectionTitles].toLowerCase()}...`}
                value={newItems[section] || ""}
                onChange={(e) => setNewItems(prev => ({ ...prev, [section]: e.target.value }))}
                className="min-h-[80px]"
              />
              <Button
                onClick={() => addItem(section)}
                disabled={!newItems[section]?.trim() || loading}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Suggestions */}
          {sectionSuggestions && sectionSuggestions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4" />
                Suggestions:
              </Label>
              <div className="space-y-2">
                {sectionSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => addSuggestion(section, suggestion)}
                    className="h-auto p-2 justify-start text-left whitespace-normal"
                    disabled={loading}
                  >
                    <Plus className="h-3 w-3 mr-2 shrink-0" />
                    <span className="text-xs">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading && packages.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading packages...</p>
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          icons={[Workflow]}
          title="Package-Specific Ways of Working"
          description="Define how you work with clients for each of your packages"
        />
        
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  No packages configured
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You need to create packages in the "Rates & Packages" section first before you can configure package-specific ways of working.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Workflow]}
        title="Package-Specific Ways of Working"
        description="Define how you work with clients for each of your packages"
      />
      
      {/* Package Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Select Package to Configure
            </Label>
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
            
            {activePackageId && packages.length > 1 && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const sourcePackages = packages.filter((pkg: any) => pkg.id !== activePackageId && getPackageWorkflow(pkg.id));
                    if (sourcePackages.length > 0) {
                      // For simplicity, clone from the first available package with workflow
                      const sourcePackage = sourcePackages[0];
                      const packageForCloning = packages.find((pkg: any) => pkg.id === activePackageId);
                      if (packageForCloning) {
                        clonePackageWorkflow(sourcePackage.id, activePackageId, packageForCloning.name);
                      }
                    }
                  }}
                  disabled={packages.filter((pkg: any) => pkg.id !== activePackageId && getPackageWorkflow(pkg.id)).length === 0}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Clone from another package
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Configuration */}
      {activePackageId && currentPackage && (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="onboarding" className="text-xs">Getting Started</TabsTrigger>
              <TabsTrigger value="first_week" className="text-xs">First Week</TabsTrigger>
              <TabsTrigger value="ongoing_structure" className="text-xs">Ongoing</TabsTrigger>
              <TabsTrigger value="tracking_tools" className="text-xs">Tracking</TabsTrigger>
              <TabsTrigger value="client_expectations" className="text-xs">Expectations</TabsTrigger>
              <TabsTrigger value="what_i_bring" className="text-xs">What I Bring</TabsTrigger>
            </TabsList>

            {Object.keys(sectionTitles).map(section => (
              <TabsContent key={section} value={section}>
                {renderSection(section)}
              </TabsContent>
            ))}
          </Tabs>

          {/* Visibility Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {currentWorkflow?.visibility === 'public' ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-orange-600" />
                )}
                <CardTitle className="text-sm">Package Visibility</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Control when clients can see this package's ways of working
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <Select 
                value={currentWorkflow?.visibility || 'public'} 
                onValueChange={updateVisibility}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">Public</div>
                        <div className="text-xs text-muted-foreground">Visible during matching process</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="post_match">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-orange-600" />
                      <div>
                        <div className="font-medium">Post-match only</div>
                        <div className="text-xs text-muted-foreground">Only visible after client selects you</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
