import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Eye, EyeOff, Info, Package, AlertCircle } from "lucide-react";
import { usePackageWaysOfWorking, PackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";
import { useToast } from "@/hooks/use-toast";

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

export function PackageWaysOfWorkingSection({ formData }: PackageWaysOfWorkingSectionProps) {
  const { packageWorkflows, loading, savePackageWorkflow, getPackageWorkflow } = usePackageWaysOfWorking();
  const { toast } = useToast();
  const [activePackageId, setActivePackageId] = useState<string>("");
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
  
  // Set default active package
  useEffect(() => {
    if (packages.length > 0 && !activePackageId) {
      setActivePackageId(packages[0].id);
    }
  }, [packages, activePackageId]);

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

      setNewItems(prev => ({ ...prev, [section]: "" }));
      
      toast({
        title: "Item added",
        description: `Added to ${sectionTitles[section as keyof typeof sectionTitles]}`,
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

      toast({
        title: "Suggestion added",
        description: `Added "${suggestion}" to ${sectionTitles[section as keyof typeof sectionTitles]}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add suggestion. Please try again.",
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

  const renderSection = (section: string) => {
    if (!currentWorkflow) return null;
    
    const items = currentWorkflow[`${section}_items` as keyof PackageWaysOfWorking] as WaysOfWorkingItem[] || [];
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Loading package workflows...</div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
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
                        £{pkg.price}
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
      {activePackageId && currentPackage && (
        <Tabs defaultValue="onboarding" className="w-full">
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