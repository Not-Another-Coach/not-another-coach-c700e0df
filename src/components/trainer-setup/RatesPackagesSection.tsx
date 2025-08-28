import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, Plus, DollarSign, PoundSterling, Euro, Calendar as CalendarIcon, Sparkles, Edit, CreditCard } from "lucide-react";
import { SectionHeader } from './SectionHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [currency, setCurrency] = useState<'GBP' | 'USD' | 'EUR'>('GBP');
  const [packages, setPackages] = useState<TrainingPackage[]>(formData.package_options || []);
  const [editingPackage, setEditingPackage] = useState<TrainingPackage | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [showCloneConfirmation, setShowCloneConfirmation] = useState(false);
  const [packageToClone, setPackageToClone] = useState<TrainingPackage | null>(null);
  const [cloneWaysOfWorkingData, setCloneWaysOfWorkingData] = useState<{
    sourcePackageId: string;
    targetPackageId: string;
    targetPackageName: string;
  } | null>(null);
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

  const { getPackageWorkflow, savePackageWorkflow } = usePackageWaysOfWorking();
  const { toast } = useToast();

  const addPackage = () => {
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

  const startCloneProcess = (pkg: TrainingPackage) => {
    setPackageToClone(pkg);
    setShowCloneConfirmation(true);
  };

  const clonePackage = async (pkg: TrainingPackage, copyWaysOfWorking: boolean = false) => {
    const clonedPackage: TrainingPackage = {
      id: Date.now().toString(),
      name: `${pkg.name} (Copy)`,
      sessions: pkg.sessions,
      price: pkg.price,
      currency: pkg.currency,
      description: pkg.description,
      isPromotion: pkg.isPromotion,
      promotionStartDate: pkg.promotionStartDate,
      promotionEndDate: pkg.promotionEndDate,
    };
    
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

    // Store the cloning info for later use when package is saved
    if (copyWaysOfWorking) {
      setCloneWaysOfWorkingData({
        sourcePackageId: pkg.id,
        targetPackageId: clonedPackage.id,
        targetPackageName: clonedPackage.name
      });
    }
  };

  const copyPackageWaysOfWorking = async (sourcePackageId: string, targetPackageId: string, targetPackageName: string) => {
    try {
      // Check if the source package has ways of working configured
      const sourceWorkflow = getPackageWorkflow(sourcePackageId);
      
      if (!sourceWorkflow) {
        toast({
          title: "No ways of working to copy",
          description: "The source package doesn't have any ways of working configured.",
          variant: "default",
        });
        return;
      }

      // Clone the ways of working by saving the source workflow data with the new package details
      await savePackageWorkflow(targetPackageId, targetPackageName, {
        onboarding_items: sourceWorkflow.onboarding_items,
        first_week_items: sourceWorkflow.first_week_items,
        ongoing_structure_items: sourceWorkflow.ongoing_structure_items,
        tracking_tools_items: sourceWorkflow.tracking_tools_items,
        client_expectations_items: sourceWorkflow.client_expectations_items,
        what_i_bring_items: sourceWorkflow.what_i_bring_items,
        visibility: sourceWorkflow.visibility,
      });
      
      toast({
        title: "Ways of working copied",
        description: "The ways of working have been copied to your new package",
      });
    } catch (error) {
      console.error('Error copying ways of working:', error);
      toast({
        title: "Error copying ways of working",
        description: "There was an issue copying the ways of working. You can set them up manually in the Ways of Working tab.",
        variant: "destructive",
      });
    }
  };

  const removePackage = (id: string) => {
    const updatedPackages = packages.filter(pkg => pkg.id !== id);
    setPackages(updatedPackages);
    updateFormData({ package_options: updatedPackages });
  };

  const startEditPackage = (pkg: TrainingPackage) => {
    setEditingPackage(pkg);
    setIsCloning(false);
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

  const saveEditedPackage = () => {
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
        
        // Handle ways of working copying if needed
        if (cloneWaysOfWorkingData && cloneWaysOfWorkingData.targetPackageId === updatedPackage.id) {
          copyPackageWaysOfWorking(
            cloneWaysOfWorkingData.sourcePackageId,
            cloneWaysOfWorkingData.targetPackageId,
            updatedPackage.name
          );
          setCloneWaysOfWorkingData(null);
        }
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
        icons={[DollarSign]}
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={currency === 'GBP' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrency('GBP')}
            className="flex items-center gap-2"
          >
            <PoundSterling className="h-4 w-4" />
            British Pound (£)
          </Button>
          <Button
            variant={currency === 'USD' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrency('USD')}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            US Dollar ($)
          </Button>
          <Button
            variant={currency === 'EUR' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrency('EUR')}
            className="flex items-center gap-2"
          >
            <Euro className="h-4 w-4" />
            Euro (€)
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
                <CardContent className="p-4">
                   <div className="flex items-start justify-between">
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-2">
                         <h4 className="font-medium">{pkg.name}</h4>
                         {pkg.isPromotion && (
                           <Badge variant="default" className="bg-orange-500 text-white">
                             <Sparkles className="h-3 w-3 mr-1" />
                             Promotion
                           </Badge>
                         )}
                         {pkg.sessions && (
                           <Badge variant="outline">{pkg.sessions} sessions</Badge>
                         )}
                         <Badge variant="secondary">
                           {pkg.currency === 'GBP' ? '£' : pkg.currency === 'USD' ? '$' : '€'}{pkg.price}
                         </Badge>
                       </div>
                        <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDuration(pkg)}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {formatPaymentMode(pkg)}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            Paid {pkg.payoutFrequency || 'monthly'}
                          </div>
                        </div>
                        
                        {pkg.isPromotion && pkg.promotionStartDate && pkg.promotionEndDate && (
                          <p className="text-xs text-orange-600 mt-1">
                            🎯 Valid from {format(pkg.promotionStartDate, 'MMM dd, yyyy')} to {format(pkg.promotionEndDate, 'MMM dd, yyyy')}
                          </p>
                        )}
                     </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startCloneProcess(pkg)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditPackage(pkg)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePackage(pkg.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="package-name">Package Name *</Label>
              <Input
                id="package-name"
                value={newPackage.name}
                onChange={(e) => setNewPackage(prev => ({...prev, name: e.target.value}))}
                placeholder="e.g., Transformation Package"
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
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="package-price">Package Price ({currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}) *</Label>
              <Input
                id="package-price"
                type="number"
                step="0.01"
                value={newPackage.price}
                onChange={(e) => setNewPackage(prev => ({...prev, price: e.target.value}))}
                placeholder="e.g., 400"
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
            <div>
              <Label htmlFor="duration-weeks">Duration (Weeks)</Label>
              <Input
                id="duration-weeks"
                type="number"
                value={newPackage.durationWeeks}
                onChange={(e) => setNewPackage(prev => ({...prev, durationWeeks: e.target.value}))}
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <Label htmlFor="duration-months">Duration (Months)</Label>
              <Input
                id="duration-months"
                type="number"
                value={newPackage.durationMonths}
                onChange={(e) => setNewPackage(prev => ({...prev, durationMonths: e.target.value}))}
                placeholder="e.g., 3"
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
                    type="checkbox"
                    id="payment-upfront"
                    checked={newPackage.customerPaymentModes.includes('upfront')}
                    onChange={(e) => {
                      const modes = e.target.checked 
                        ? [...newPackage.customerPaymentModes, 'upfront' as const]
                        : newPackage.customerPaymentModes.filter(m => m !== 'upfront');
                      setNewPackage(prev => ({...prev, customerPaymentModes: modes.length > 0 ? modes : ['upfront' as const]}));
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="payment-upfront">Full Payment Upfront</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="payment-installments"
                    checked={newPackage.customerPaymentModes.includes('installments')}
                    onChange={(e) => {
                      const modes = e.target.checked 
                        ? [...newPackage.customerPaymentModes, 'installments' as const]
                        : newPackage.customerPaymentModes.filter(m => m !== 'installments');
                      setNewPackage(prev => ({...prev, customerPaymentModes: modes.length > 0 ? modes : ['upfront' as const]}));
                    }}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Promotion Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newPackage.promotionStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPackage.promotionStartDate ? format(newPackage.promotionStartDate, "PPP") : "Pick start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPackage.promotionStartDate}
                          onSelect={(date) => setNewPackage(prev => ({...prev, promotionStartDate: date}))}
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
                            !newPackage.promotionEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPackage.promotionEndDate ? format(newPackage.promotionEndDate, "PPP") : "Pick end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPackage.promotionEndDate}
                          onSelect={(date) => setNewPackage(prev => ({...prev, promotionEndDate: date}))}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
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

      {/* Clone Confirmation Dialog */}
      <AlertDialog open={showCloneConfirmation} onOpenChange={setShowCloneConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clone Package</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to copy the "Ways of Working" from "{packageToClone?.name}" to the new package?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              if (packageToClone) {
                clonePackage(packageToClone, false);
              }
              setShowCloneConfirmation(false);
              setPackageToClone(null);
            }}>
              Clone Package Only
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (packageToClone) {
                clonePackage(packageToClone, true);
              }
              setShowCloneConfirmation(false);
              setPackageToClone(null);
            }}>
              Clone Package + Ways of Working
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Package Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={() => {
        setEditingPackage(null);
        setIsCloning(false);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isCloning ? "Complete Cloned Package" : "Edit Package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Package Name *</Label>
                <Input
                  id="edit-name"
                  value={editPackageData.name}
                  onChange={(e) => setEditPackageData(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Personal Training Package"
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
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Package Price ({currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editPackageData.price}
                  onChange={(e) => setEditPackageData(prev => ({...prev, price: e.target.value}))}
                  placeholder="e.g., 800"
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-durationWeeks">Duration (Weeks)</Label>
                <Input
                  id="edit-durationWeeks"
                  type="number"
                  value={editPackageData.durationWeeks}
                  onChange={(e) => setEditPackageData(prev => ({...prev, durationWeeks: e.target.value}))}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="edit-durationMonths">Duration (Months)</Label>
                <Input
                  id="edit-durationMonths"
                  type="number"
                  value={editPackageData.durationMonths}
                  onChange={(e) => setEditPackageData(prev => ({...prev, durationMonths: e.target.value}))}
                  placeholder="e.g., 3"
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
                      type="checkbox"
                      id="edit-payment-upfront"
                      checked={editPackageData.customerPaymentModes.includes('upfront')}
                      onChange={(e) => {
                        const modes = e.target.checked 
                          ? [...editPackageData.customerPaymentModes, 'upfront' as const]
                          : editPackageData.customerPaymentModes.filter(m => m !== 'upfront');
                        setEditPackageData(prev => ({...prev, customerPaymentModes: modes.length > 0 ? modes : ['upfront' as const]}));
                      }}
                      className="rounded"
                    />
                    <Label htmlFor="edit-payment-upfront">Full Payment Upfront</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-payment-installments"
                      checked={editPackageData.customerPaymentModes.includes('installments')}
                      onChange={(e) => {
                        const modes = e.target.checked 
                          ? [...editPackageData.customerPaymentModes, 'installments' as const]
                          : editPackageData.customerPaymentModes.filter(m => m !== 'installments');
                        setEditPackageData(prev => ({...prev, customerPaymentModes: modes.length > 0 ? modes : ['upfront' as const]}));
                      }}
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
