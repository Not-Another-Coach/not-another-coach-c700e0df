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
    console.log('[WoW Debug] Form data package_options:', formData.package_options);
  }, [packages, activePackageId, formData.package_options]);
  
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

  // Create workflow when package is selected if it doesn't exist
  useEffect(() => {
    const createWorkflowIfNeeded = async () => {
      if (activePackageId && packages.length > 0) {
        const currentPackage = packages.find((pkg: any) => pkg.id === activePackageId);
        const existingWorkflow = getPackageWorkflow(activePackageId);
        
        console.log('[WoW Debug] Current package:', currentPackage?.name);
        console.log('[WoW Debug] Existing workflow:', existingWorkflow ? 'Found' : 'Not found');
        
        if (currentPackage && !existingWorkflow) {
          try {
            console.log('[WoW Debug] Creating workflow for package:', currentPackage.name);
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

  // Get current package workflow
  const currentWorkflow = activePackageId ? getPackageWorkflow(activePackageId) : null;
  const currentPackage = packages.find((pkg: any) => pkg.id === activePackageId);

  const addItem = async (section: string) => {
    const text = newItems[section]?.trim();
    if (!text || !activePackageId || !currentPackage) return;

    try {
      const currentItems = currentWorkflow?.[`${section}_items` as keyof PackageWaysOfWorking] as WaysOfWorkingItem[] || [];
      const newItem: WaysOfWorkingItem = {
        id: Date.now().toString(),
        text: text
      };

      const updatedItems = [...currentItems, newItem];
      
      await savePackageWorkflow(activePackageId, currentPackage.name, {
        ...currentWorkflow,
        [`${section}_items`]: updatedItems
      });

      // Automatically sync the new item to activities
      try {
        await syncWaysOfWorkingToActivities(activePackageId, section, [newItem]);
        
        toast({
          title: "Item added & synced",
          description: `Added to ${sectionTitles[section as keyof typeof sectionTitles]} and synced to activities`,
        });
      } catch (syncError) {
        // Still show success for adding item, but warn about sync failure
        toast({
          title: "Item added",
          description: `Added to ${sectionTitles[section as keyof typeof sectionTitles]} (sync to activities failed)`,
        });
      }

      setNewItems(prev => ({ ...prev, [section]: "" }));
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

    try {
      const currentItems = currentWorkflow?.[`${section}_items` as keyof PackageWaysOfWorking] as WaysOfWorkingItem[] || [];
      const updatedItems = currentItems.filter((item: WaysOfWorkingItem) => item.id !== itemId);
      
      await savePackageWorkflow(activePackageId, currentPackage.name, {
        ...currentWorkflow,
        [`${section}_items`]: updatedItems
      });

      toast({
        title: "Item removed",
        description: `Removed from ${sectionTitles[section as keyof typeof sectionTitles]}`,
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

    try {
      const currentItems = currentWorkflow?.[`${section}_items` as keyof PackageWaysOfWorking] as WaysOfWorkingItem[] || [];
      const newItem: WaysOfWorkingItem = {
        id: Date.now().toString(),
        text: suggestion
      };

      const updatedItems = [...currentItems, newItem];
      
      await savePackageWorkflow(activePackageId, currentPackage.name, {
        ...currentWorkflow,
        [`${section}_items`]: updatedItems
      });

      // Automatically sync the suggestion to activities
      try {
        await syncWaysOfWorkingToActivities(activePackageId, section, [newItem]);
      } catch (syncError) {
        console.error('Failed to sync suggestion to activities:', syncError);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add suggestion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const syncSectionToActivities = async (section: string) => {
    if (!activePackageId || !currentWorkflow) return;

    try {
      const items = currentWorkflow[`${section}_items` as keyof PackageWaysOfWorking] as WaysOfWorkingItem[] || [];
      
      if (items.length === 0) {
        toast({
          title: "No items to sync",
          description: `No items found in ${sectionTitles[section as keyof typeof sectionTitles]}`,
        });
        return;
      }

      await syncWaysOfWorkingToActivities(activePackageId, section, items);
      
      toast({
        title: "Section synced",
        description: `${items.length} items from ${sectionTitles[section as keyof typeof sectionTitles]} synced to activities`,
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
                  <Button
                    key={index}
                    variant={isAdded ? "default" : "outline"}
                    size="sm"
                    className={`transition-colors ${
                      isAdded 
                        ? "opacity-50 cursor-not-allowed" 
                        : ""
                    }`}
                    onClick={() => !isAdded && addSuggestion(section, suggestion)}
                    disabled={isAdded}
                  >
                    {suggestion}
                    {isAdded && <span className="ml-1">✓</span>}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          icons={[Package, Workflow]}
          title="Package Ways of Working"
          description="Define how you work with clients for each of your packages"
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
          icons={[Package, Workflow]}
          title="Package Ways of Working"
          description="Define how you work with clients for each of your packages"
        />
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
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

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Package, Workflow]}
        title="Package Ways of Working"
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
                      const currentPackage = packages.find((pkg: any) => pkg.id === activePackageId);
                      if (currentPackage) {
                        clonePackageWorkflow(sourcePackage.id, activePackageId, currentPackage.name);
                      }
                    }
                  }}
                  disabled={packages.filter((pkg: any) => pkg.id !== activePackageId && getPackageWorkflow(pkg.id)).length === 0}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Clone from another package
                </Button>
                {packages.filter((pkg: any) => pkg.id !== activePackageId && getPackageWorkflow(pkg.id)).length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure ways of working for other packages first to enable cloning
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Package Workflow Configuration */}
      {activePackageId && currentPackage && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="onboarding">Getting Started</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing Support</TabsTrigger>
            <TabsTrigger value="expectations">Expectations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="onboarding" className="space-y-4">
            {renderSection("onboarding")}
            {renderSection("first_week")}
          </TabsContent>
          
          <TabsContent value="ongoing" className="space-y-4">
            {renderSection("ongoing_structure")}
            {renderSection("tracking_tools")}
            {renderSection("what_i_bring")}
          </TabsContent>
          
          <TabsContent value="expectations" className="space-y-4">
            {renderSection("client_expectations")}
            
            {/* Visibility Setting */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    When should clients see these details?
                  </Label>
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
                          <span>Show only after matching</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}