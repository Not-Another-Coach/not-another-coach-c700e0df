import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Plus, DollarSign, PoundSterling, Euro, Calendar as CalendarIcon, Sparkles, Edit, CreditCard } from "lucide-react";
import { SectionHeader } from './SectionHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface RatesPackagesSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

interface TrainingPackage {
  id: string;
  name: string;
  sessions?: number;
  price: number;
  currency: string;
  description: string;
  inclusions?: string[]; // Add inclusions field
  isPromotion?: boolean;
  promotionStartDate?: Date;
  promotionEndDate?: Date;
  durationWeeks?: number;
  durationMonths?: number;
  payoutFrequency?: 'weekly' | 'monthly';
  customerPaymentModes?: ('upfront' | 'installments')[];  // Changed to array
  installmentCount?: number;
  // Add calculated fields for display
  upfrontAmount?: number;
  installmentAmount?: number;
}

export function RatesPackagesSection({ formData, updateFormData, errors, clearFieldError }: RatesPackagesSectionProps) {
  const { user } = useAuth();
  // Initialize currency from existing packages or default to GBP
  const getInitialCurrency = (): 'GBP' | 'USD' | 'EUR' => {
    if (formData.package_options && formData.package_options.length > 0) {
      return formData.package_options[0].currency || 'GBP';
    }
    return 'GBP';
  };
  
  const [currency, setCurrency] = useState<'GBP' | 'USD' | 'EUR'>(getInitialCurrency());
  const [packages, setPackages] = useState<TrainingPackage[]>(formData.package_options || []);
  const [editingPackage, setEditingPackage] = useState<TrainingPackage | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [editPackageData, setEditPackageData] = useState({
    name: "",
    sessions: "",
    price: "",
    description: "",
    isPromotion: false,
    promotionStartDate: undefined as Date | undefined,
    promotionEndDate: undefined as Date | undefined,
    durationWeeks: "",
    durationMonths: "",
    payoutFrequency: "monthly" as 'weekly' | 'monthly',
    customerPaymentModes: ['upfront'] as ('upfront' | 'installments')[],  // Changed to array
    installmentCount: "",
  });
  const [newPackage, setNewPackage] = useState({
    name: "",
    sessions: "",
    price: "",
    description: "",
    terms: "",
    inclusions: [] as string[],
    isPromotion: false,
    promotionStartDate: undefined as Date | undefined,
    promotionEndDate: undefined as Date | undefined,
    durationWeeks: "",
    durationMonths: "",
    payoutFrequency: "monthly" as 'weekly' | 'monthly',
    customerPaymentModes: ['upfront'] as ('upfront' | 'installments')[],  // Changed to array
    installmentCount: "",
  });

  const { getPackageWorkflow, savePackageWorkflow, cleanupOrphanedWorkflows, refetch } = usePackageWaysOfWorking();
  const { toast } = useToast();
  
  // Clean up orphaned workflows ONLY on component mount (not on packages changes)
  useEffect(() => {
    const performCleanup = async () => {
      if (user?.id && packages.length > 0) {
        try {
          const validPackageIds = packages.map(pkg => pkg.id);
          const cleanedCount = await cleanupOrphanedWorkflows(validPackageIds);
          if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} orphaned Ways of Working records`);
          }
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
    };
    
    // Only run cleanup once on mount when packages are first loaded
    if (packages.length > 0) {
      performCleanup();
    }
  }, [user?.id]); // Removed packages.length dependency to prevent cleanup on every change

  const addPackage = async () => {
    if (newPackage.name && newPackage.price && newPackage.description) {
      const trainingPackage: TrainingPackage = {
        id: Date.now().toString(),
        name: newPackage.name,
        sessions: newPackage.sessions ? parseInt(newPackage.sessions) : undefined,
        price: parseFloat(newPackage.price),
        currency,
        description: newPackage.description,
        isPromotion: newPackage.isPromotion,
        promotionStartDate: newPackage.promotionStartDate,
        promotionEndDate: newPackage.promotionEndDate,
        durationWeeks: newPackage.durationWeeks ? parseInt(newPackage.durationWeeks) : undefined,
        durationMonths: newPackage.durationMonths ? parseInt(newPackage.durationMonths) : undefined,
        payoutFrequency: newPackage.payoutFrequency,
        customerPaymentModes: newPackage.customerPaymentModes,
        installmentCount: newPackage.installmentCount ? parseInt(newPackage.installmentCount) : undefined,
        // Calculate payment amounts for display
        upfrontAmount: parseFloat(newPackage.price),
        installmentAmount: newPackage.installmentCount ? 
          parseFloat(newPackage.price) / parseInt(newPackage.installmentCount) : undefined,
      };
      
      const updatedPackages = [...packages, trainingPackage];
      setPackages(updatedPackages);
      updateFormData({ package_options: updatedPackages });
      
      // Immediately save to database to ensure sync with Ways of Working
      if (user?.id) {
        await supabase
          .from('trainer_profiles')
          .update({ package_options: updatedPackages as any })
          .eq('id', user.id);
      }
      
      setNewPackage({
        name: "",
        sessions: "",
        price: "",
        description: "",
        terms: "",
        inclusions: [],
        isPromotion: false,
        promotionStartDate: undefined,
        promotionEndDate: undefined,
        durationWeeks: "",
        durationMonths: "",
        payoutFrequency: "monthly",
        customerPaymentModes: ['upfront'],
        installmentCount: "",
      });
    }
  };

  const clonePackage = (pkg: TrainingPackage) => {
    const clonedPackage: TrainingPackage = {
      id: Date.now().toString(),
      name: `${pkg.name} (Copy)`,
      sessions: pkg.sessions,
      price: pkg.price,
      currency: pkg.currency,
      description: pkg.description,
      inclusions: pkg.inclusions || [], // Copy inclusions from original package
      isPromotion: pkg.isPromotion,
      promotionStartDate: pkg.promotionStartDate,
      promotionEndDate: pkg.promotionEndDate,
      durationWeeks: pkg.durationWeeks,
      durationMonths: pkg.durationMonths,
      payoutFrequency: pkg.payoutFrequency || "monthly",
      customerPaymentModes: pkg.customerPaymentModes || ['upfront'],
      installmentCount: pkg.installmentCount,
      upfrontAmount: pkg.upfrontAmount,
      installmentAmount: pkg.installmentAmount,
    };
    
    console.log('[Clone Debug] Original package inclusions:', pkg.inclusions);
    console.log('[Clone Debug] Cloned package inclusions:', clonedPackage.inclusions);
    
    // Set up for immediate editing
    setEditingPackage(clonedPackage);
    setIsCloning(true);
    setEditPackageData({
      name: clonedPackage.name,
      sessions: clonedPackage.sessions?.toString() || "",
      price: clonedPackage.price.toString(),
      description: clonedPackage.description,
      isPromotion: clonedPackage.isPromotion || false,
      promotionStartDate: clonedPackage.promotionStartDate,
      promotionEndDate: clonedPackage.promotionEndDate,
      durationWeeks: pkg.durationWeeks?.toString() || "",
      durationMonths: pkg.durationMonths?.toString() || "",
      payoutFrequency: pkg.payoutFrequency || "monthly",
      customerPaymentModes: pkg.customerPaymentModes || ['upfront'],
      installmentCount: pkg.installmentCount?.toString() || "",
    });
  };

  const copyPackageWaysOfWorking = async (sourcePackageId: string, targetPackageId: string, targetPackageName: string) => {
    try {
      // Show progress to user
      toast({
        title: "Copying ways of working...",
        description: "Please wait while we copy the ways of working data.",
      });

      // Validate input parameters
      if (!sourcePackageId || !targetPackageId || !targetPackageName) {
        throw new Error('Missing required parameters for copying ways of working');
      }

      // Try to get data directly from database first (not relying on stale state)
      let { data: fullSourceWorkflow, error: fetchError } = await supabase
        .from('package_ways_of_working')
        .select('*')
        .eq('package_id', sourcePackageId)
        .eq('trainer_id', user?.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching full workflow data:', fetchError);
        throw fetchError;
      }

      // If no package-specific data found, check state as fallback
      if (!fullSourceWorkflow) {
        const sourceWorkflow = getPackageWorkflow(sourcePackageId);
        
        if (!sourceWorkflow) {
          console.log(`[Copy WoW] No state data found either, trying profile data`);
          // Try to get from trainer profile as final fallback

          const { data: trainerProfile } = await supabase
            .from('profiles')
            .select('wow_activities, wow_activity_assignments, wow_visibility')
            .eq('id', user?.id)
            .single();

          if (trainerProfile?.wow_activities && typeof trainerProfile.wow_activities === 'object') {
            console.log(`[Copy WoW] Using profile data as source`);
            // Convert profile data to package format
            const activities = trainerProfile.wow_activities as any;
            
            const convertActivitiesToItems = (activityArray: any): { id: string; text: string; }[] => {
              if (!Array.isArray(activityArray)) return [];
              return activityArray.map((activity: any) => ({
                id: activity.id || crypto.randomUUID(),
                text: activity.name || activity.text || ''
              }));
            };

            const convertedWorkflow = {
              onboarding_items: convertActivitiesToItems(activities.wow_how_i_work || []),
              first_week_items: convertActivitiesToItems(activities.wow_what_i_provide || []),
              client_expectations_items: convertActivitiesToItems(activities.wow_client_expectations || []),
              ongoing_structure_items: [] as { id: string; text: string; }[],
              tracking_tools_items: [] as { id: string; text: string; }[],
              what_i_bring_items: [] as { id: string; text: string; }[],
              visibility: (typeof trainerProfile.wow_visibility === 'string' ? trainerProfile.wow_visibility : 'public') as 'public' | 'post_match',
              // Include required activity ID fields
              onboarding_activity_ids: [],
              first_week_activity_ids: [],
              ongoing_structure_activity_ids: [],
              tracking_tools_activity_ids: [],
              client_expectations_activity_ids: [],
              what_i_bring_activity_ids: [],
            };

            await savePackageWorkflow(targetPackageId, targetPackageName, convertedWorkflow);
            console.log(`[Copy WoW] Successfully copied from profile to package ${targetPackageId}`);

            toast({
              title: "Ways of working copied",
              description: "The ways of working have been copied from your profile to the new package",
            });
            return;
          }
        } else {
          // We have state data but no DB data, use the state data with proper validation
          console.log(`[Copy WoW] Using state data for package ${sourcePackageId}`);
          
          // Validate that state data has actual content
          const hasContent = sourceWorkflow.onboarding_items?.length || 
                           sourceWorkflow.first_week_items?.length ||
                           sourceWorkflow.ongoing_structure_items?.length ||
                           sourceWorkflow.tracking_tools_items?.length ||
                           sourceWorkflow.client_expectations_items?.length ||
                           sourceWorkflow.what_i_bring_items?.length;

          if (!hasContent) {
            console.log(`[Copy WoW] State data exists but is empty for package ${sourcePackageId}`);
            toast({
              title: "No content to copy",
              description: "The source package has ways of working configured but no actual content to copy.",
              variant: "default",
            });
            return;
          }

          // Copy from state data
          fullSourceWorkflow = sourceWorkflow;
        }
      }

      // Final check - if we still don't have source data, fail gracefully
      if (!fullSourceWorkflow) {
        console.log(`[Copy WoW] No source data found for package ${sourcePackageId}`);
        toast({
          title: "No ways of working to copy",
          description: "The source package doesn't have any ways of working configured.",
          variant: "default",
        });
        return;
      }

      console.log(`[Copy WoW] Copying data to package ${targetPackageId}`);
      
      // Copy the ways of working data
      const savedData = await savePackageWorkflow(targetPackageId, targetPackageName, {
        onboarding_items: (fullSourceWorkflow.onboarding_items as { id: string; text: string; }[]) || [],
        first_week_items: (fullSourceWorkflow.first_week_items as { id: string; text: string; }[]) || [],
        ongoing_structure_items: (fullSourceWorkflow.ongoing_structure_items as { id: string; text: string; }[]) || [],
        tracking_tools_items: (fullSourceWorkflow.tracking_tools_items as { id: string; text: string; }[]) || [],
        client_expectations_items: (fullSourceWorkflow.client_expectations_items as { id: string; text: string; }[]) || [],
        what_i_bring_items: (fullSourceWorkflow.what_i_bring_items as { id: string; text: string; }[]) || [],
        visibility: (fullSourceWorkflow.visibility as 'public' | 'post_match') || 'public',
        // Copy activity IDs if they exist, otherwise use empty arrays
        onboarding_activity_ids: fullSourceWorkflow.onboarding_activity_ids || [],
        first_week_activity_ids: fullSourceWorkflow.first_week_activity_ids || [],
        ongoing_structure_activity_ids: fullSourceWorkflow.ongoing_structure_activity_ids || [],
        tracking_tools_activity_ids: fullSourceWorkflow.tracking_tools_activity_ids || [],
        client_expectations_activity_ids: fullSourceWorkflow.client_expectations_activity_ids || [],
        what_i_bring_activity_ids: fullSourceWorkflow.what_i_bring_activity_ids || [],
      });

      // Check if the save operation succeeded
      if (!savedData) {
        console.warn(`[Copy WoW] Save operation returned no data for package ${targetPackageId}`);
        toast({
          title: "Copy failed",
          description: "Failed to save the copied ways of working data.",
          variant: "destructive",
        });
        return;
      }

      // Add a small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log(`[Copy WoW] Verifying successful copy for package ${targetPackageId}`);
      const { data: verifyData } = await supabase
        .from('package_ways_of_working')
        .select('id')
        .eq('package_id', targetPackageId)
        .eq('trainer_id', user?.id)
        .maybeSingle();

      if (verifyData) {
        console.log(`[Copy WoW] Copy verification successful for package ${targetPackageId}`);
        toast({
          title: "Ways of working copied successfully",
          description: `The ways of working have been copied to "${targetPackageName}"`,
        });
      } else {
        console.warn(`[Copy WoW] Copy verification failed for package ${targetPackageId}`);
        toast({
          title: "Copy completed with warnings",
          description: "The copy process completed but verification failed. Please check the Ways of Working tab.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('[Copy WoW] Error copying ways of working:', error);
      toast({
        title: "Error copying ways of working",
        description: `Failed to copy ways of working: ${error instanceof Error ? error.message : 'Unknown error'}. You can set them up manually in the Ways of Working tab.`,
        variant: "destructive",
      });
    }
  };

  const removePackage = async (id: string) => {
    const packageToDelete = packages.find(pkg => pkg.id === id);
    
    try {
      const updatedPackages = packages.filter(pkg => pkg.id !== id);
      setPackages(updatedPackages);
      updateFormData({ package_options: updatedPackages });
      
      // Delete from both profile and package_ways_of_working table
      if (user?.id) {
        // Update the profile
        await supabase
          .from('trainer_profiles')
          .update({ package_options: updatedPackages as any })
          .eq('id', user.id);
        
        // Delete associated Ways of Working data
        const { error: deleteError } = await supabase
          .from('package_ways_of_working')
          .delete()
          .eq('trainer_id', user.id)
          .eq('package_id', id);
        
        if (deleteError) {
          console.error('Error deleting Ways of Working data:', deleteError);
          toast({
            title: "Warning",
            description: "Package deleted but some associated data may remain. Please refresh the page.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Package deleted",
            description: `${packageToDelete?.name || 'Package'} and all associated data removed successfully.`,
          });
        }
      }
    } catch (error) {
      console.error('Error removing package:', error);
      toast({
        title: "Error",
        description: "Failed to delete package. Please try again.",
        variant: "destructive",
      });
      // Revert the local state on error
      setPackages(packages);
      updateFormData({ package_options: packages });
    }
  };

  const startEditPackage = (pkg: TrainingPackage) => {
    setEditingPackage(pkg);
    setIsCloning(false);
    // Update currency to match the package being edited
    setCurrency(pkg.currency as 'GBP' | 'USD' | 'EUR');
    setEditPackageData({
      name: pkg.name,
      sessions: pkg.sessions?.toString() || "",
      price: pkg.price.toString(),
      description: pkg.description,
      isPromotion: pkg.isPromotion || false,
      promotionStartDate: pkg.promotionStartDate,
      promotionEndDate: pkg.promotionEndDate,
      durationWeeks: pkg.durationWeeks?.toString() || "",
      durationMonths: pkg.durationMonths?.toString() || "",
      payoutFrequency: pkg.payoutFrequency || "monthly",
      customerPaymentModes: pkg.customerPaymentModes || ['upfront'],
      installmentCount: pkg.installmentCount?.toString() || "",
    });
  };

  const saveEditedPackage = async () => {
    if (editingPackage && editPackageData.name && editPackageData.description && editPackageData.price) {
      const updatedPackage: TrainingPackage = {
        ...editingPackage,
        name: editPackageData.name,
        sessions: editPackageData.sessions ? parseInt(editPackageData.sessions) : undefined,
        price: parseFloat(editPackageData.price),
        description: editPackageData.description,
        isPromotion: editPackageData.isPromotion,
        promotionStartDate: editPackageData.promotionStartDate,
        promotionEndDate: editPackageData.promotionEndDate,
        durationWeeks: editPackageData.durationWeeks ? parseInt(editPackageData.durationWeeks) : undefined,
        durationMonths: editPackageData.durationMonths ? parseInt(editPackageData.durationMonths) : undefined,
        payoutFrequency: editPackageData.payoutFrequency,
        customerPaymentModes: editPackageData.customerPaymentModes,
        installmentCount: editPackageData.installmentCount ? parseInt(editPackageData.installmentCount) : undefined,
        // Calculate payment amounts for display
        upfrontAmount: parseFloat(editPackageData.price),
        installmentAmount: editPackageData.installmentCount ? 
          parseFloat(editPackageData.price) / parseInt(editPackageData.installmentCount) : undefined,
      };
      
      let updatedPackages;
      if (isCloning) {
        // Add the new cloned package
        updatedPackages = [...packages, updatedPackage];
        toast({
          title: "Package cloned",
          description: "Package has been duplicated successfully",
        });
      } else {
        // Update existing package
        updatedPackages = packages.map(pkg => 
          pkg.id === editingPackage.id ? updatedPackage : pkg
        );
        toast({
          title: "Package updated",
          description: "Package has been updated successfully",
        });
      }
      
      setPackages(updatedPackages);
      updateFormData({ package_options: updatedPackages });
      
      console.log('[Package Debug] Updated packages in formData:', updatedPackages.map(p => ({ id: p.id, name: p.name })));
      
      // Immediately save to database to ensure sync with Ways of Working
      if (user?.id) {
        await supabase
          .from('trainer_profiles')
          .update({ package_options: updatedPackages as any })
          .eq('id', user.id);
      }
      
      // Close the modal and reset the editing state
      setEditingPackage(null);
      setIsCloning(false);
      setEditPackageData({
        name: "",
        sessions: "",
        price: "",
        description: "",
        isPromotion: false,
        promotionStartDate: undefined,
        promotionEndDate: undefined,
        durationWeeks: "",
        durationMonths: "",
        payoutFrequency: "monthly",
        customerPaymentModes: ['upfront'],
        installmentCount: "",
      });
    }
  };

  const formatDuration = (pkg: TrainingPackage) => {
    if (pkg.durationMonths) {
      return `${pkg.durationMonths} month${pkg.durationMonths > 1 ? 's' : ''}`;
    }
    if (pkg.durationWeeks) {
      return `${pkg.durationWeeks} week${pkg.durationWeeks > 1 ? 's' : ''}`;
    }
    return "Duration TBD";
  };

  const formatPaymentMode = (pkg: TrainingPackage) => {
    if (!pkg.customerPaymentModes || pkg.customerPaymentModes.length === 0) {
      return "Payment TBD";
    }
    
    const modes = pkg.customerPaymentModes;
    if (modes.length === 1) {
      if (modes[0] === 'upfront') {
        return "Full payment upfront";
      } else {
        const count = pkg.installmentCount || 2;
        return `${count} installments`;
      }
    } else {
      // Both options available
      const installmentText = pkg.installmentCount ? 
        `${pkg.installmentCount} installments` : "installments";
      return `Upfront or ${installmentText}`;
    }
  };

  const standardInclusions = [
    "Personalized workout plan",
    "Nutrition guidance",
    "Progress tracking",
    "WhatsApp support",
    "Weekly check-ins",
    "Goal setting session",
    "Equipment recommendations",
    "Form corrections",
    "Motivation and accountability"
  ];

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[currency === 'GBP' ? PoundSterling : currency === 'EUR' ? Euro : DollarSign]}
        title="Rates & Packages"
        description="Set your currency and create training packages for clients"
      />
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Helpful Tip:</strong> Create tiered packages to give clients options and increase your average booking value. For example: "4 sessions for £200" and "12 sessions for £500" provides better value for committed clients.
        </p>
      </div>
      
      {/* Currency Toggle */}
      <div className="space-y-2">
        <Label>Currency</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            variant={currency === 'GBP' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrency('GBP')}
            className="flex items-center justify-center gap-2 w-full"
          >
            <PoundSterling className="h-4 w-4" />
            <span className="hidden sm:inline">British Pound</span>
            <span className="sm:hidden">GBP</span>
            <span>(£)</span>
          </Button>
          <Button
            variant={currency === 'USD' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrency('USD')}
            className="flex items-center justify-center gap-2 w-full"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">US Dollar</span>
            <span className="sm:hidden">USD</span>
            <span>($)</span>
          </Button>
          <Button
            variant={currency === 'EUR' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrency('EUR')}
            className="flex items-center justify-center gap-2 w-full"
          >
            <Euro className="h-4 w-4" />
            <span className="hidden sm:inline">Euro</span>
            <span className="sm:hidden">EUR</span>
            <span>(€)</span>
          </Button>
        </div>
      </div>

      {/* Tiered Package Pricing */}
      <div className="space-y-4">
        <div>
          <Label>Training Packages *</Label>
          <p className="text-sm text-muted-foreground">
            Create packages like "10 PT sessions for £400" to offer better value for clients
          </p>
          {errors?.package_options && (
            <p className="text-sm text-destructive mt-1">{errors.package_options}</p>
          )}
        </div>

        {/* Existing Packages */}
        {packages.length > 0 && (
          <div className="space-y-3">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                 <CardContent className="p-3 sm:p-4">
                   <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                     <div className="flex-1 w-full">
                       <div className="flex flex-wrap items-center gap-2 mb-2">
                         <h4 className="font-medium text-sm sm:text-base">{pkg.name}</h4>
                         {pkg.isPromotion && (
                           <Badge variant="default" className="bg-orange-500 text-white text-xs">
                             <Sparkles className="h-3 w-3 mr-1" />
                             Promotion
                           </Badge>
                         )}
                         {pkg.sessions && (
                           <Badge variant="outline" className="text-xs">{pkg.sessions} sessions</Badge>
                         )}
                         <Badge variant="secondary" className="text-xs">
                           {pkg.currency === 'GBP' ? '£' : pkg.currency === 'USD' ? '$' : '€'}{pkg.price}
                         </Badge>
                       </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">{pkg.description}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs">{formatDuration(pkg)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs">{formatPaymentMode(pkg)}</span>
                          </div>
                           <div className="flex items-center gap-1">
                             {pkg.currency === 'GBP' ? (
                               <PoundSterling className="h-3 w-3 sm:h-4 sm:w-4" />
                             ) : pkg.currency === 'EUR' ? (
                               <Euro className="h-3 w-3 sm:h-4 sm:w-4" />
                             ) : (
                               <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                             )}
                             <span className="text-xs">Paid {pkg.payoutFrequency || 'monthly'}</span>
                           </div>
                        </div>
                        
                        {pkg.isPromotion && pkg.promotionStartDate && pkg.promotionEndDate && (
                          <p className="text-xs text-orange-600 mt-1">
                            🎯 Valid from {format(pkg.promotionStartDate, 'MMM dd, yyyy')} to {format(pkg.promotionEndDate, 'MMM dd, yyyy')}
                          </p>
                        )}
                     </div>
                      <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clonePackage(pkg)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditPackage(pkg)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePackage(pkg.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                   </div>
                 </CardContent>
              </Card>
            ))}
          </div>
        )}

      {/* Add New Package */}
      <Card>
        <CardHeader>
          <CardTitle>Add Training Package</CardTitle>
        </CardHeader>
         <CardContent className="space-y-4 p-3 sm:p-6">
           <div className="grid grid-cols-1 gap-4">
             <div>
               <Label htmlFor="package-name">Package Name *</Label>
               <Input
                 id="package-name"
                 value={newPackage.name}
                 onChange={(e) => setNewPackage(prev => ({...prev, name: e.target.value}))}
                 placeholder="e.g., Transformation Package"
                 className="text-sm"
               />
             </div>
             <div>
               <Label htmlFor="package-sessions">Number of Sessions</Label>
               <Input
                 id="package-sessions"
                 type="number"
                 value={newPackage.sessions}
                 onChange={(e) => setNewPackage(prev => ({...prev, sessions: e.target.value}))}
                 placeholder="e.g., 12"
                 className="text-sm"
               />
             </div>
           </div>
           
           <div>
             <Label htmlFor="package-description">Package Description *</Label>
             <Textarea
               id="package-description"
               value={newPackage.description}
               onChange={(e) => setNewPackage(prev => ({...prev, description: e.target.value}))}
               placeholder="Describe what's included in this package..."
               rows={3}
               className="text-sm resize-none"
             />
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
               <Label htmlFor="package-price">Price ({currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}) *</Label>
               <Input
                 id="package-price"
                 type="number"
                 step="0.01"
                 value={newPackage.price}
                 onChange={(e) => setNewPackage(prev => ({...prev, price: e.target.value}))}
                 placeholder="e.g., 400"
                 className="text-sm"
               />
             </div>
             <div>
               <Label htmlFor="payout-frequency">Payout Frequency</Label>
               <Select 
                 value={newPackage.payoutFrequency} 
                 onValueChange={(value: 'weekly' | 'monthly') => 
                   setNewPackage(prev => ({...prev, payoutFrequency: value}))
                 }
               >
                 <SelectTrigger className="bg-background">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="bg-background border z-50">
                   <SelectItem value="weekly">Weekly</SelectItem>
                   <SelectItem value="monthly">Monthly</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">  
             <div>
               <Label htmlFor="duration-weeks">Duration (Weeks)</Label>
                <Input
                  id="duration-weeks"
                  type="number"
                  value={newPackage.durationWeeks}
                  onChange={(e) => setNewPackage(prev => ({...prev, durationWeeks: e.target.value, durationMonths: "" }))}
                  placeholder="e.g., 12"
                  className="text-sm"
                />
             </div>
             <div>
               <Label htmlFor="duration-months">Duration (Months)</Label>
                <Input
                  id="duration-months"
                  type="number"
                  value={newPackage.durationMonths}
                  onChange={(e) => setNewPackage(prev => ({...prev, durationMonths: e.target.value, durationWeeks: "" }))}
                  placeholder="e.g., 3"
                  className="text-sm"
                />
             </div>
           </div>

          <div className="space-y-4">
            <div>
              <Label>Customer Payment Options</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select which payment options clients can choose from
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="payment-mode-new"
                    id="payment-upfront"
                    checked={newPackage.customerPaymentModes.includes('upfront')}
                    onChange={() => setNewPackage(prev => ({...prev, customerPaymentModes: ['upfront']}))}
                    className="rounded"
                  />
                  <Label htmlFor="payment-upfront">Full Payment Upfront</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="payment-mode-new"
                    id="payment-installments"
                    checked={newPackage.customerPaymentModes.includes('installments')}
                    onChange={() => setNewPackage(prev => ({...prev, customerPaymentModes: ['installments']}))}
                    className="rounded"
                  />
                  <Label htmlFor="payment-installments">Installment Payments</Label>
                </div>
              </div>
            </div>
            
            {newPackage.customerPaymentModes.includes('installments') && (
              <div>
                <Label htmlFor="installment-count">Number of Installments</Label>
                <Input
                  id="installment-count"
                  type="number"
                  min="2"
                  max="12"
                  value={newPackage.installmentCount}
                  onChange={(e) => setNewPackage(prev => ({...prev, installmentCount: e.target.value}))}
                  placeholder="e.g., 3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newPackage.price && newPackage.installmentCount ? 
                    `Each installment: ${currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}${(parseFloat(newPackage.price) / parseInt(newPackage.installmentCount)).toFixed(2)}` 
                    : 'Enter price and installment count to see amount per installment'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Promotion Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is-promotion"
                checked={newPackage.isPromotion}
                onCheckedChange={(checked) => setNewPackage(prev => ({...prev, isPromotion: checked}))}
              />
              <Label htmlFor="is-promotion" className="font-medium">🎯 Limited Time Promotion</Label>
            </div>
            
            {newPackage.isPromotion && (
              <div className="ml-6 space-y-4 border-l-2 border-orange-200 pl-4">
                <p className="text-sm text-muted-foreground">
                  Set a promotional period for this package to create urgency
                </p>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Promotion Start Date</Label>
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button
                           variant="outline"
                           className={cn(
                             "w-full justify-start text-left font-normal text-sm",
                             !newPackage.promotionStartDate && "text-muted-foreground"
                           )}
                         >
                           <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                           <span className="truncate">
                             {newPackage.promotionStartDate ? format(newPackage.promotionStartDate, "MMM dd, yyyy") : "Start date"}
                           </span>
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0 bg-background border z-50" align="start">
                         <Calendar
                           mode="single"
                           selected={newPackage.promotionStartDate}
                           onSelect={(date) => setNewPackage(prev => ({...prev, promotionStartDate: date}))}
                           initialFocus
                           className="p-3"
                         />
                       </PopoverContent>
                     </Popover>
                   </div>
                   
                   <div className="space-y-2">
                     <Label>Promotion End Date</Label>
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button
                           variant="outline"
                           className={cn(
                             "w-full justify-start text-left font-normal text-sm",
                             !newPackage.promotionEndDate && "text-muted-foreground"
                           )}
                         >
                           <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                           <span className="truncate">
                             {newPackage.promotionEndDate ? format(newPackage.promotionEndDate, "MMM dd, yyyy") : "End date"}
                           </span>
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0 bg-background border z-50" align="start">
                         <Calendar
                           mode="single"
                           selected={newPackage.promotionEndDate}
                           onSelect={(date) => setNewPackage(prev => ({...prev, promotionEndDate: date}))}
                           initialFocus
                           className="p-3"
                         />
                       </PopoverContent>
                     </Popover>
                   </div>
                 </div>
                
                {newPackage.promotionStartDate && newPackage.promotionEndDate && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-2">
                    <p className="text-xs text-orange-700">
                      🎯 This promotion will be visible to clients from {format(newPackage.promotionStartDate, 'MMM dd, yyyy')} until {format(newPackage.promotionEndDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Button 
            onClick={addPackage}
            disabled={!newPackage.name || !newPackage.price || !newPackage.description || (newPackage.isPromotion && (!newPackage.promotionStartDate || !newPackage.promotionEndDate))}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </CardContent>
      </Card>
      </div>

      {/* Edit Package Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={() => {
        setEditingPackage(null);
        setIsCloning(false);
      }}>
        <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{isCloning ? "Complete Cloned Package" : "Edit Package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Package Name *</Label>
                <Input
                  id="edit-name"
                  value={editPackageData.name}
                  onChange={(e) => setEditPackageData(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Personal Training Package"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="edit-sessions">Sessions</Label>
                <Input
                  id="edit-sessions"
                  type="number"
                  value={editPackageData.sessions}
                  onChange={(e) => setEditPackageData(prev => ({...prev, sessions: e.target.value}))}
                  placeholder="e.g., 12"
                  className="text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editPackageData.description}
                onChange={(e) => setEditPackageData(prev => ({...prev, description: e.target.value}))}
                placeholder="Describe what's included in this package"
                rows={3}
                className="text-sm resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price ({currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editPackageData.price}
                  onChange={(e) => setEditPackageData(prev => ({...prev, price: e.target.value}))}
                  placeholder="e.g., 800"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="edit-payoutFrequency">Payout Frequency</Label>
                <Select 
                  value={editPackageData.payoutFrequency} 
                  onValueChange={(value: 'weekly' | 'monthly') => 
                    setEditPackageData(prev => ({...prev, payoutFrequency: value}))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-durationWeeks">Duration (Weeks)</Label>
                <Input
                  id="edit-durationWeeks"
                  type="number"
                  value={editPackageData.durationWeeks}
                  onChange={(e) => setEditPackageData(prev => ({...prev, durationWeeks: e.target.value, durationMonths: "" }))}
                  placeholder="e.g., 12"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="edit-durationMonths">Duration (Months)</Label>
                <Input
                  id="edit-durationMonths"
                  type="number"
                  value={editPackageData.durationMonths}
                  onChange={(e) => setEditPackageData(prev => ({...prev, durationMonths: e.target.value, durationWeeks: "" }))}
                  placeholder="e.g., 3"
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Customer Payment Options</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select which payment options clients can choose from
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="payment-mode-edit"
                      id="edit-payment-upfront"
                      checked={editPackageData.customerPaymentModes.includes('upfront')}
                      onChange={() => setEditPackageData(prev => ({...prev, customerPaymentModes: ['upfront']}))}
                      className="rounded"
                    />
                    <Label htmlFor="edit-payment-upfront">Full Payment Upfront</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="payment-mode-edit"
                      id="edit-payment-installments"
                      checked={editPackageData.customerPaymentModes.includes('installments')}
                      onChange={() => setEditPackageData(prev => ({...prev, customerPaymentModes: ['installments']}))}
                      className="rounded"
                    />
                    <Label htmlFor="edit-payment-installments">Installment Payments</Label>
                  </div>
                </div>
              </div>
              
              {editPackageData.customerPaymentModes.includes('installments') && (
                <div>
                  <Label htmlFor="edit-installmentCount">Number of Installments</Label>
                  <Input
                    id="edit-installmentCount"
                    type="number"
                    min="2"
                    max="12"
                    value={editPackageData.installmentCount}
                    onChange={(e) => setEditPackageData(prev => ({...prev, installmentCount: e.target.value}))}
                    placeholder="e.g., 3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {editPackageData.price && editPackageData.installmentCount ? 
                      `Each installment: ${currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}${(parseFloat(editPackageData.price) / parseInt(editPackageData.installmentCount)).toFixed(2)}` 
                      : 'Enter price and installment count to see amount per installment'
                    }
                  </p>
                </div>
              )}
            </div>
            
            {/* Promotion Settings in Edit */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is-promotion"
                  checked={editPackageData.isPromotion}
                  onCheckedChange={(checked) => setEditPackageData(prev => ({...prev, isPromotion: checked}))}
                />
                <Label htmlFor="edit-is-promotion" className="font-medium">🎯 Limited Time Promotion</Label>
              </div>
              
              {editPackageData.isPromotion && (
                <div className="ml-6 space-y-4 border-l-2 border-orange-200 pl-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Promotion Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !editPackageData.promotionStartDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editPackageData.promotionStartDate ? format(editPackageData.promotionStartDate, "PPP") : "Pick start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editPackageData.promotionStartDate}
                            onSelect={(date) => setEditPackageData(prev => ({...prev, promotionStartDate: date}))}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Promotion End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !editPackageData.promotionEndDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editPackageData.promotionEndDate ? format(editPackageData.promotionEndDate, "PPP") : "Pick end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editPackageData.promotionEndDate}
                            onSelect={(date) => setEditPackageData(prev => ({...prev, promotionEndDate: date}))}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  {editPackageData.promotionStartDate && editPackageData.promotionEndDate && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-2">
                      <p className="text-xs text-orange-700">
                        🎯 This promotion will be visible to clients from {format(editPackageData.promotionStartDate, 'MMM dd, yyyy')} until {format(editPackageData.promotionEndDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setEditingPackage(null);
                setIsCloning(false);
              }}>
                Cancel
              </Button>
              <Button onClick={saveEditedPackage}>
                {isCloning ? "Create Package" : "Update Package"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
