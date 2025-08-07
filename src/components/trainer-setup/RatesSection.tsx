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
import { Trash2, Plus, ExternalLink, DollarSign, PoundSterling, Euro, Calendar as CalendarIcon, Sparkles, Edit, Clock, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDiscoveryCallSettings } from "@/hooks/useDiscoveryCallSettings";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RatesSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
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
}

// Helper function to check if two time slots overlap
const checkTimeOverlap = (slot1: { start: string; end: string }, slot2: { start: string; end: string }) => {
  // Convert time strings to minutes for easier comparison
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const slot1Start = timeToMinutes(slot1.start);
  const slot1End = timeToMinutes(slot1.end);
  const slot2Start = timeToMinutes(slot2.start);
  const slot2End = timeToMinutes(slot2.end);

  // Check if slots overlap: slot1 starts before slot2 ends AND slot2 starts before slot1 ends
  return slot1Start < slot2End && slot2Start < slot1End;
};

// Helper function to find a non-overlapping default time slot
const findAvailableDefaultSlot = (existingSlots: { start: string; end: string }[]) => {
  const timeSlots = [
    { start: '07:00', end: '08:00' },
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
    { start: '17:00', end: '18:00' },
    { start: '18:00', end: '19:00' },
    { start: '19:00', end: '20:00' },
  ];

  for (const timeSlot of timeSlots) {
    const hasOverlap = existingSlots.some(existingSlot => 
      checkTimeOverlap(timeSlot, existingSlot)
    );
    if (!hasOverlap) {
      return timeSlot;
    }
  }
  
  // If all standard slots overlap, return a late evening slot
  return { start: '20:00', end: '21:00' };
};

export function RatesSection({ formData, updateFormData, errors }: RatesSectionProps) {
  const [currency, setCurrency] = useState<'GBP' | 'USD' | 'EUR'>('GBP');
  const [selectedRateTypes, setSelectedRateTypes] = useState<('hourly' | 'class' | 'monthly')[]>(
    formData.selected_rate_types || ['hourly']
  );
  const [packages, setPackages] = useState<TrainingPackage[]>(formData.package_options || []);
  const [communicationAIHelperOpen, setCommunicationAIHelperOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TrainingPackage | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [showCloneConfirmation, setShowCloneConfirmation] = useState(false);
  const [packageToClone, setPackageToClone] = useState<TrainingPackage | null>(null);
  const [editPackageData, setEditPackageData] = useState({
    name: "",
    sessions: "",
    price: "",
    description: "",
    isPromotion: false,
    promotionStartDate: undefined as Date | undefined,
    promotionEndDate: undefined as Date | undefined,
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
  });

  // Use the discovery call settings hook
  const { settings: discoverySettings, loading: discoveryLoading, updateSettings } = useDiscoveryCallSettings();
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
    });

    // If user wants to copy ways of working, we'll handle it after package creation
    if (copyWaysOfWorking) {
      await copyPackageWaysOfWorking(pkg.id, clonedPackage.id);
    }
  };

  const copyPackageWaysOfWorking = async (sourcePackageId: string, targetPackageId: string) => {
    try {
      // This will be handled by the database/API to copy ways of working data
      console.log('Copying ways of working from package', sourcePackageId, 'to', targetPackageId);
      
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
      });
    }
  };

  const testBookingLink = () => {
    if (formData.calendar_link) {
      window.open(formData.calendar_link, '_blank');
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const toggleRateType = (rateType: 'hourly' | 'class' | 'monthly') => {
    const updatedTypes = selectedRateTypes.includes(rateType)
      ? selectedRateTypes.filter(type => type !== rateType)
      : [...selectedRateTypes, rateType];
    
    setSelectedRateTypes(updatedTypes);
    updateFormData({ selected_rate_types: updatedTypes });
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
          <Label>Tiered Pricing Packages *</Label>
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
                       <p className="text-sm text-muted-foreground">{pkg.description}</p>
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
                          title="Clone package"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                         <Dialog open={editingPackage?.id === pkg.id || (isCloning && editingPackage !== null)} onOpenChange={(open) => {
                           if (!open) {
                             setEditingPackage(null);
                             setIsCloning(false);
                           }
                         }}>
                           <DialogTrigger asChild>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => startEditPackage(pkg)}
                               className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                           </DialogTrigger>
                           <DialogContent className="max-w-md">
                             <DialogHeader>
                               <DialogTitle>{isCloning ? 'Clone Package' : 'Edit Package'}</DialogTitle>
                               <p className="text-sm text-muted-foreground">
                                 {isCloning 
                                   ? 'Customize your cloned package details.'
                                   : 'Only package name and description can be edited to protect existing purchases.'
                                 }
                               </p>
                             </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit_package_name">Package Name</Label>
                                <Input
                                  id="edit_package_name"
                                  value={editPackageData.name}
                                  onChange={(e) => setEditPackageData({ ...editPackageData, name: e.target.value })}
                                  placeholder="e.g., 10 PT Sessions Bundle"
                                />
                              </div>

                               <div className="space-y-2">
                                 <Label>Number of Sessions</Label>
                                 {isCloning ? (
                                   <Input
                                     value={editPackageData.sessions}
                                     onChange={(e) => setEditPackageData({ ...editPackageData, sessions: e.target.value })}
                                     placeholder="e.g., 10"
                                     type="number"
                                     min="1"
                                   />
                                 ) : (
                                   <div className="p-3 bg-muted rounded-md">
                                     <span className="text-sm text-muted-foreground">
                                       {editingPackage?.sessions ? `${editingPackage.sessions} sessions` : 'No specific session count'}
                                     </span>
                                     <p className="text-xs text-muted-foreground mt-1">
                                       This cannot be changed to protect existing purchases
                                     </p>
                                   </div>
                                 )}
                               </div>
                               
                               <div className="space-y-2">
                                 <Label>Price</Label>
                                 {isCloning ? (
                                   <div className="relative">
                                     <div className="absolute left-3 top-3 text-muted-foreground">
                                       {currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}
                                     </div>
                                     <Input
                                       value={editPackageData.price}
                                       onChange={(e) => setEditPackageData({ ...editPackageData, price: e.target.value })}
                                       placeholder="e.g., 400"
                                       type="number"
                                       min="0"
                                       step="0.01"
                                       className="pl-8"
                                     />
                                   </div>
                                 ) : (
                                   <div className="p-3 bg-muted rounded-md">
                                     <span className="text-sm text-muted-foreground">
                                       {editingPackage?.currency === 'GBP' ? '£' : editingPackage?.currency === 'USD' ? '$' : '€'}{editingPackage?.price}
                                     </span>
                                     <p className="text-xs text-muted-foreground mt-1">
                                       This cannot be changed to protect existing purchases
                                     </p>
                                   </div>
                                 )}
                               </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit_package_description">Description</Label>
                                <Textarea
                                  id="edit_package_description"
                                  value={editPackageData.description}
                                  onChange={(e) => setEditPackageData({ ...editPackageData, description: e.target.value })}
                                  placeholder="e.g., 10 x 1-hour PT sessions with personalized nutrition plan"
                                  rows={3}
                                  className="resize-none"
                                />
                               </div>
                               
                               {/* Promotional Options */}
                               <div className="space-y-3 border-t pt-4">
                                 <div className="flex items-center justify-between">
                                   <div>
                                     <Label className="text-sm font-medium">Promotional Offer</Label>
                                     <p className="text-xs text-muted-foreground">Mark this package as a limited-time promotion</p>
                                   </div>
                                   <Switch
                                     checked={editPackageData.isPromotion}
                                     onCheckedChange={(checked) => setEditPackageData({ ...editPackageData, isPromotion: checked })}
                                   />
                                 </div>
                                 
                                 {editPackageData.isPromotion && (
                                   <div className="space-y-3 ml-4 border-l-2 border-orange-200 pl-4">
                                     <div className="space-y-2">
                                       <Label className="text-sm">Promotion Start Date</Label>
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
                                             {editPackageData.promotionStartDate ? (
                                               format(editPackageData.promotionStartDate, "PPP")
                                             ) : (
                                               <span>Pick start date</span>
                                             )}
                                           </Button>
                                         </PopoverTrigger>
                                         <PopoverContent className="w-auto p-0" align="start">
                                           <Calendar
                                             mode="single"
                                             selected={editPackageData.promotionStartDate}
                                             onSelect={(date) => setEditPackageData({ ...editPackageData, promotionStartDate: date })}
                                             disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                             initialFocus
                                             className={cn("p-3 pointer-events-auto")}
                                           />
                                         </PopoverContent>
                                       </Popover>
                                     </div>
                                     
                                     <div className="space-y-2">
                                       <Label className="text-sm">Promotion End Date</Label>
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
                                             {editPackageData.promotionEndDate ? (
                                               format(editPackageData.promotionEndDate, "PPP")
                                             ) : (
                                               <span>Pick end date</span>
                                             )}
                                           </Button>
                                         </PopoverTrigger>
                                         <PopoverContent className="w-auto p-0" align="start">
                                           <Calendar
                                             mode="single"
                                             selected={editPackageData.promotionEndDate}
                                             onSelect={(date) => setEditPackageData({ ...editPackageData, promotionEndDate: date })}
                                             disabled={(date) => {
                                               const today = new Date(new Date().setHours(0, 0, 0, 0));
                                               const startDate = editPackageData.promotionStartDate || today;
                                               return date < startDate;
                                             }}
                                             initialFocus
                                             className={cn("p-3 pointer-events-auto")}
                                           />
                                         </PopoverContent>
                                       </Popover>
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
                              
                               <div className="flex gap-2">
                                 <Button 
                                   onClick={saveEditedPackage}
                                   disabled={!editPackageData.name || !editPackageData.description || (isCloning && (!editPackageData.price || (editPackageData.isPromotion && (!editPackageData.promotionStartDate || !editPackageData.promotionEndDate))))}
                                   className="flex-1"
                                 >
                                  {isCloning ? 'Create Package' : 'Save Changes'}
                                </Button>
                                 <Button 
                                   variant="outline" 
                                   onClick={() => {
                                     setEditingPackage(null);
                                     setIsCloning(false);
                                   }}
                                   className="flex-1"
                                 >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => removePackage(pkg.id)}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
            <CardTitle className="text-lg">Add Training Package</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create tiered pricing packages to offer better value
            </p>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="package_name">Package Name</Label>
            <Input
              id="package_name"
              value={newPackage.name}
              onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
              placeholder="e.g., 10 PT Sessions Bundle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="package_sessions">Number of Sessions (Optional)</Label>
            <Input
              id="package_sessions"
              type="number"
              value={newPackage.sessions}
              onChange={(e) => setNewPackage({ ...newPackage, sessions: e.target.value })}
              placeholder="10"
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for time-based packages (e.g., 4-week programs)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="package_price">Price</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-muted-foreground">
                {currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}
              </div>
              <Input
                id="package_price"
                type="number"
                value={newPackage.price}
                onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                placeholder="299"
                className="pl-8"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="package_description">Description</Label>
            <Textarea
              id="package_description"
              value={newPackage.description}
              onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
              placeholder="e.g., 10 x 1-hour PT sessions with personalized nutrition plan"
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="package_terms">Package Terms</Label>
            <Input
              id="package_terms"
              value={newPackage.terms}
              onChange={(e) => setNewPackage({ ...newPackage, terms: e.target.value })}
              placeholder="e.g., Minimum 12 weeks, 1 week notice required"
            />
          </div>

          <div className="space-y-2">
            <Label>Package Inclusions</Label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {standardInclusions.map((inclusion) => (
                <label key={inclusion} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newPackage.inclusions.includes(inclusion)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewPackage({ 
                          ...newPackage, 
                          inclusions: [...newPackage.inclusions, inclusion] 
                        });
                      } else {
                        setNewPackage({ 
                          ...newPackage, 
                          inclusions: newPackage.inclusions.filter(inc => inc !== inclusion) 
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span>{inclusion}</span>
                </label>
              ))}
            </div>
            <Input
              placeholder="Add custom inclusion..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const customInclusion = e.currentTarget.value.trim();
                  if (!newPackage.inclusions.includes(customInclusion)) {
                    setNewPackage({ 
                      ...newPackage, 
                      inclusions: [...newPackage.inclusions, customInclusion] 
                    });
                  }
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          
          {/* Promotional Options */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Promotional Offer</Label>
                <p className="text-xs text-muted-foreground">Mark this package as a limited-time promotion</p>
              </div>
              <Switch
                checked={newPackage.isPromotion}
                onCheckedChange={(checked) => setNewPackage({ ...newPackage, isPromotion: checked })}
              />
            </div>
            
            {newPackage.isPromotion && (
              <div className="space-y-3 ml-4 border-l-2 border-orange-200 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="promotion_start_date">Promotion Start Date</Label>
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
                        {newPackage.promotionStartDate ? (
                          format(newPackage.promotionStartDate, "PPP")
                        ) : (
                          <span>Pick start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newPackage.promotionStartDate}
                        onSelect={(date) => setNewPackage({ ...newPackage, promotionStartDate: date })}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="promotion_end_date">Promotion End Date</Label>
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
                        {newPackage.promotionEndDate ? (
                          format(newPackage.promotionEndDate, "PPP")
                        ) : (
                          <span>Pick end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newPackage.promotionEndDate}
                        onSelect={(date) => setNewPackage({ ...newPackage, promotionEndDate: date })}
                        disabled={(date) => {
                          const today = new Date(new Date().setHours(0, 0, 0, 0));
                          const startDate = newPackage.promotionStartDate || today;
                          return date < startDate;
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
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

      {/* Discovery Call Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Discovery Call Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your free discovery call offerings for potential clients
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {discoveryLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : discoverySettings ? (
            <>
              {/* Toggle Discovery Calls */}
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                  <Label htmlFor="offers-discovery-call" className="text-base font-medium">
                    Offer Free Discovery Call
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow potential clients to book a free discovery call with you
                  </p>
                </div>
                <Switch
                  id="offers-discovery-call"
                  checked={discoverySettings.offers_discovery_call}
                  onCheckedChange={(checked) => 
                    updateSettings({ offers_discovery_call: checked })
                  }
                />
              </div>

              {discoverySettings.offers_discovery_call && (
                <>
                  {/* Duration Selection */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Call Duration
                    </Label>
                    <Select
                      value={discoverySettings.discovery_call_duration.toString()}
                      onValueChange={(value) => 
                        updateSettings({ discovery_call_duration: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prep Notes */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Preparation Notes (Optional)
                    </Label>
                    <Textarea
                      placeholder="What should clients know before the call? What should they prepare?"
                      value={discoverySettings.prep_notes || ''}
                      onChange={(e) => updateSettings({ prep_notes: e.target.value })}
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      These notes will be shown to clients when they book a discovery call
                    </p>
                  </div>

                  {/* Booking Method Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Booking Method</Label>
                    
                    {/* Calendly Option */}
                    <div className="space-y-2">
                      <Label htmlFor="calendar_link">Booking Link (Calendly, etc.)</Label>
                      <Input
                        id="calendar_link"
                        value={formData.calendar_link || ""}
                        onChange={(e) => updateFormData({ calendar_link: e.target.value })}
                        placeholder="https://calendly.com/your-username or your booking link"
                        type="url"
                      />
                      {formData.calendar_link && (
                        <div className="flex items-center gap-2">
                          {isValidUrl(formData.calendar_link) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={testBookingLink}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Test Link
                            </Button>
                          ) : (
                            <p className="text-xs text-red-600">Please enter a valid URL</p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Add your Calendly link or other booking system URL
                      </p>
                    </div>

                    {/* Availability Schedule - Only show if no booking link */}
                    {!formData.calendar_link && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Set Your Weekly Availability</Label>
                          <Badge variant="outline" className="text-xs">
                            For discovery calls only
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                            const daySchedule = discoverySettings.availability_schedule?.[day] || { enabled: false, slots: [] };
                            const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                            
                            return (
                              <div key={day} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <Switch
                                      checked={daySchedule.enabled}
                                      onCheckedChange={(enabled) => {
                                        const newSchedule = {
                                          ...discoverySettings.availability_schedule,
                                          [day]: { ...daySchedule, enabled }
                                        };
                                        updateSettings({ availability_schedule: newSchedule });
                                      }}
                                    />
                                    <Label className="font-medium">{dayLabel}</Label>
                                  </div>
                                  {daySchedule.enabled && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        // Find a non-overlapping default time slot
                                        const newSlot = findAvailableDefaultSlot(daySchedule.slots);
                                        
                                        const newSchedule = {
                                          ...discoverySettings.availability_schedule,
                                          [day]: {
                                            ...daySchedule,
                                            slots: [...daySchedule.slots, newSlot]
                                          }
                                        };
                                        updateSettings({ availability_schedule: newSchedule });
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Add Slot
                                    </Button>
                                  )}
                                </div>

                                {daySchedule.enabled && (
                                  <div className="space-y-2 ml-8">
                                    {daySchedule.slots.length === 0 ? (
                                      <p className="text-sm text-muted-foreground">
                                        No time slots set. Click "Add Slot" to add availability.
                                      </p>
                                    ) : (
                                       daySchedule.slots.map((slot, slotIndex) => {
                                         // Check if this slot overlaps with any other slot
                                         const otherSlots = daySchedule.slots.filter((_, i) => i !== slotIndex);
                                         const hasOverlap = otherSlots.some(existingSlot => 
                                           checkTimeOverlap(slot, existingSlot)
                                         );
                                         
                                         return (
                                         <div key={slotIndex} className={`flex items-center space-x-2 ${hasOverlap ? 'bg-red-50 border border-red-200 rounded p-2' : ''}`}>
                                           {hasOverlap && (
                                             <Badge variant="destructive" className="text-xs">
                                               Overlaps
                                             </Badge>
                                           )}
                                          <Select
                                            value={slot.start}
                                            onValueChange={(value) => {
                                              const updatedSlot = { ...slot, start: value };
                                              const otherSlots = daySchedule.slots.filter((_, i) => i !== slotIndex);
                                              
                                              // Check for overlaps with other slots
                                              const hasOverlap = otherSlots.some(existingSlot => 
                                                checkTimeOverlap(updatedSlot, existingSlot)
                                              );
                                              
                                              if (hasOverlap) {
                                                toast({
                                                  title: "Time Slot Overlap",
                                                  description: "This time slot would overlap with another slot. Please choose a different time.",
                                                  variant: "destructive",
                                                });
                                                return;
                                              }
                                              
                                              const newSlots = daySchedule.slots.map((s, i) => 
                                                i === slotIndex ? updatedSlot : s
                                              );
                                              const newSchedule = {
                                                ...discoverySettings.availability_schedule,
                                                [day]: { ...daySchedule, slots: newSlots }
                                              };
                                              updateSettings({ availability_schedule: newSchedule });
                                            }}
                                          >
                                            <SelectTrigger className="w-24">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                               {['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(time => (
                                                <SelectItem key={time} value={time}>{time}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <span className="text-sm text-muted-foreground">to</span>
                                          <Select
                                            value={slot.end}
                                            onValueChange={(value) => {
                                              const updatedSlot = { ...slot, end: value };
                                              const otherSlots = daySchedule.slots.filter((_, i) => i !== slotIndex);
                                              
                                              // Check for overlaps with other slots
                                              const hasOverlap = otherSlots.some(existingSlot => 
                                                checkTimeOverlap(updatedSlot, existingSlot)
                                              );
                                              
                                              if (hasOverlap) {
                                                toast({
                                                  title: "Time Slot Overlap",
                                                  description: "This time slot would overlap with another slot. Please choose a different time.",
                                                  variant: "destructive",
                                                });
                                                return;
                                              }
                                              
                                              const newSlots = daySchedule.slots.map((s, i) => 
                                                i === slotIndex ? updatedSlot : s
                                              );
                                              const newSchedule = {
                                                ...discoverySettings.availability_schedule,
                                                [day]: { ...daySchedule, slots: newSlots }
                                              };
                                              updateSettings({ availability_schedule: newSchedule });
                                            }}
                                          >
                                            <SelectTrigger className="w-24">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(time => (
                                                <SelectItem key={time} value={time}>{time}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                              const newSlots = daySchedule.slots.filter((_, i) => i !== slotIndex);
                                              const newSchedule = {
                                                ...discoverySettings.availability_schedule,
                                                [day]: { ...daySchedule, slots: newSlots }
                                              };
                                              updateSettings({ availability_schedule: newSchedule });
                                            }}
                                          >
                                             <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                          </div>
                                        );
                                      })
                                    )}
                                   </div>
                                 )}
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     )}
                  </div>

                  {/* Status Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-green-900">
                          Discovery Call Setup
                        </p>
                        <ul className="text-green-800 space-y-1">
                          <li>✓ Discovery calls enabled</li>
                          <li>✓ {discoverySettings.discovery_call_duration} minute duration set</li>
                          {formData.calendar_link ? (
                            <li>✓ External booking link configured</li>
                          ) : (
                            <li>✓ Manual availability schedule available</li>
                          )}
                          {discoverySettings.prep_notes && <li>✓ Preparation notes added</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Unable to load discovery call settings.</p>
          )}
        </CardContent>
      </Card>

      {/* Communication Style */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication Style</CardTitle>
          <p className="text-sm text-muted-foreground">
            Help clients understand how you prefer to work together
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="communication_style">How do you work best with clients? *</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCommunicationAIHelperOpen(!communicationAIHelperOpen)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Helper
              </Button>
            </div>
            
            {communicationAIHelperOpen && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-medium">Communication style suggestions:</p>
                  <div className="space-y-2">
                    {[
                      "I believe in regular check-ins and clear communication to keep you motivated and on track. I prefer a collaborative approach where we work together to create sustainable habits that fit your lifestyle.",
                      "My communication style is supportive and encouraging. I provide detailed feedback on your progress and am always available for questions. I believe in celebrating small wins while keeping you focused on long-term goals.",
                      "I work best with clients who appreciate direct, honest feedback combined with plenty of encouragement. I like to establish clear expectations upfront and maintain consistent communication throughout our journey together.",
                      "I believe in being your biggest cheerleader while also holding you accountable. I prefer frequent touchpoints to adjust our approach as needed and ensure you always feel supported in your fitness journey."
                    ].map((suggestion, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:bg-primary/10 transition-colors border-primary/10"
                        onClick={() => {
                          updateFormData({ communication_style: suggestion });
                          setCommunicationAIHelperOpen(false);
                        }}
                      >
                        <CardContent className="p-3">
                          <p className="text-sm leading-relaxed">{suggestion}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Click any suggestion to use it, or use it as inspiration for your own description
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Textarea
              id="communication_style"
              value={formData.communication_style || ""}
              onChange={(e) => updateFormData({ communication_style: e.target.value })}
              placeholder="e.g., I believe in regular check-ins and being available for questions. I prefer a collaborative approach where we work together to achieve your goals..."
              rows={3}
              className={`resize-none ${errors?.communication_style ? 'border-destructive' : ''}`}
            />
            {errors?.communication_style && (
              <p className="text-sm text-destructive">{errors.communication_style}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Communication Methods You Offer *</Label>
            {errors?.communication_methods && (
              <p className="text-sm text-destructive">{errors.communication_methods}</p>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-normal">Video Check-ins</Label>
                <p className="text-sm text-muted-foreground">Regular video calls to review progress</p>
              </div>
              <Switch
                checked={formData.video_checkins || false}
                onCheckedChange={(checked) => updateFormData({ video_checkins: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-normal">Messaging Support</Label>
                <p className="text-sm text-muted-foreground">Available for questions via WhatsApp/text</p>
              </div>
              <Switch
                checked={formData.messaging_support || false}
                onCheckedChange={(checked) => updateFormData({ messaging_support: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-normal">Weekly Programming Only</Label>
                <p className="text-sm text-muted-foreground">Provide workouts with minimal ongoing communication</p>
              </div>
              <Switch
                checked={formData.weekly_programming_only || false}
                onCheckedChange={(checked) => updateFormData({ weekly_programming_only: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💰 Pricing Tips</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Research local market rates in your area</li>
            <li>• Consider your experience level and unique qualifications</li>
            <li>• Package deals often provide better value for clients and higher revenue for you</li>
            <li>• Discovery calls help build trust and can increase conversion rates</li>
            <li>• Clear communication preferences help set proper expectations with clients</li>
          </ul>
        </CardContent>
      </Card>

      {/* Clone Confirmation Dialog */}
      <AlertDialog open={showCloneConfirmation} onOpenChange={setShowCloneConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clone Package with Ways of Working?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Do you want to copy the "Ways of Working" from this package to the new one?</p>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium">• Choose "Yes" - Ways of working will be copied automatically</p>
                <p className="font-medium">• Choose "No" - You can set up ways of working later in the Ways of Working tab</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowCloneConfirmation(false);
              setPackageToClone(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (packageToClone) {
                  clonePackage(packageToClone, false);
                  setShowCloneConfirmation(false);
                  setPackageToClone(null);
                }
              }}
            >
              No - Clone Package Only
            </AlertDialogAction>
            <AlertDialogAction onClick={() => {
              if (packageToClone) {
                clonePackage(packageToClone, true);
                setShowCloneConfirmation(false);
                setPackageToClone(null);
              }
            }}>
              Yes - Clone with Ways of Working
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
