import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePaymentStatements } from "@/hooks/usePaymentStatements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Calendar,
  CreditCard,
  Settings 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentPackage {
  id: string;
  name: string;
  sessions?: number;
  price: number;
  currency: string;
  description: string;
  durationWeeks?: number;
  durationMonths?: number;
  payoutFrequency: 'weekly' | 'monthly';
  customerPaymentMode: 'upfront' | 'installments';
  installmentCount?: number;
}

export const PaymentPackageManagement = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { packages, loading } = usePaymentStatements();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [localPackages, setLocalPackages] = useState<PaymentPackage[]>([]);
  const [editingPackage, setEditingPackage] = useState<PaymentPackage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [packageData, setPackageData] = useState<{
    name: string;
    sessions: string;
    price: string;
    description: string;
    durationWeeks: string;
    durationMonths: string;
    payoutFrequency: 'weekly' | 'monthly';
    customerPaymentMode: 'upfront' | 'installments';
    installmentCount: string;
  }>({
    name: "",
    sessions: "",
    price: "",
    description: "",
    durationWeeks: "",
    durationMonths: "",
    payoutFrequency: "monthly",
    customerPaymentMode: "upfront",
    installmentCount: "",
  });

  // Initialize from profile data
  useEffect(() => {
    if ((profile as any)?.package_options) {
      const enhancedPackages = (profile as any).package_options.map((pkg: any) => ({
        ...pkg,
        durationWeeks: pkg.durationWeeks || 12,
        payoutFrequency: pkg.payoutFrequency || 'monthly',
        customerPaymentMode: pkg.customerPaymentMode || 'upfront',
        installmentCount: pkg.installmentCount || 1,
      }));
      setLocalPackages(enhancedPackages);
    }
  }, [(profile as any)?.package_options]);

  const handleSavePackage = async () => {
    if (!packageData.name || !packageData.price || !packageData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newPackage: PaymentPackage = {
      id: editingPackage?.id || Date.now().toString(),
      name: packageData.name,
      sessions: packageData.sessions ? parseInt(packageData.sessions) : undefined,
      price: parseFloat(packageData.price),
      currency: 'GBP', // Default for now
      description: packageData.description,
      durationWeeks: packageData.durationWeeks ? parseInt(packageData.durationWeeks) : undefined,
      durationMonths: packageData.durationMonths ? parseInt(packageData.durationMonths) : undefined,
      payoutFrequency: packageData.payoutFrequency,
      customerPaymentMode: packageData.customerPaymentMode,
      installmentCount: packageData.installmentCount ? parseInt(packageData.installmentCount) : undefined,
    };

    let updatedPackages;
    if (editingPackage) {
      updatedPackages = localPackages.map(pkg => 
        pkg.id === editingPackage.id ? newPackage : pkg
      );
      toast({
        title: "Package Updated",
        description: "Your package has been updated successfully"
      });
    } else {
      updatedPackages = [...localPackages, newPackage];
      toast({
        title: "Package Created",
        description: "Your new package has been created successfully"
      });
    }

    setLocalPackages(updatedPackages);
    
    // Update profile with enhanced package data
    await updateProfile({ package_options: updatedPackages } as any);

    // Reset form
    setPackageData({
      name: "",
      sessions: "",
      price: "",
      description: "",
      durationWeeks: "",
      durationMonths: "",
      payoutFrequency: "monthly",
      customerPaymentMode: "upfront",
      installmentCount: "",
    });
    setEditingPackage(null);
    setIsCreating(false);
  };

  const handleEditPackage = (pkg: PaymentPackage) => {
    setEditingPackage(pkg);
    setPackageData({
      name: pkg.name,
      sessions: pkg.sessions?.toString() || "",
      price: pkg.price.toString(),
      description: pkg.description,
      durationWeeks: pkg.durationWeeks?.toString() || "",
      durationMonths: pkg.durationMonths?.toString() || "",
      payoutFrequency: pkg.payoutFrequency,
      customerPaymentMode: pkg.customerPaymentMode,
      installmentCount: pkg.installmentCount?.toString() || "",
    });
    setIsCreating(true);
  };

  const handleDeletePackage = async (id: string) => {
    const updatedPackages = localPackages.filter(pkg => pkg.id !== id);
    setLocalPackages(updatedPackages);
    await updateProfile({ package_options: updatedPackages } as any);
    toast({
      title: "Package Deleted",
      description: "The package has been removed successfully"
    });
  };

  const formatDuration = (pkg: PaymentPackage) => {
    if (pkg.durationMonths) {
      return `${pkg.durationMonths} month${pkg.durationMonths > 1 ? 's' : ''}`;
    }
    if (pkg.durationWeeks) {
      return `${pkg.durationWeeks} week${pkg.durationWeeks > 1 ? 's' : ''}`;
    }
    return "Duration TBD";
  };

  const formatPaymentMode = (pkg: PaymentPackage) => {
    if (pkg.customerPaymentMode === 'upfront') {
      return "Full payment upfront";
    }
    const count = pkg.installmentCount || 2;
    return `${count} installments`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure your training packages with payment terms and payout schedules
              </p>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPackage(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPackage ? "Edit Package" : "Create New Package"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Package Name *</Label>
                      <Input
                        id="name"
                        value={packageData.name}
                        onChange={(e) => setPackageData(prev => ({...prev, name: e.target.value}))}
                        placeholder="e.g., Personal Training Package"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sessions">Sessions</Label>
                      <Input
                        id="sessions"
                        type="number"
                        value={packageData.sessions}
                        onChange={(e) => setPackageData(prev => ({...prev, sessions: e.target.value}))}
                        placeholder="e.g., 12"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={packageData.description}
                      onChange={(e) => setPackageData(prev => ({...prev, description: e.target.value}))}
                      placeholder="Describe what's included in this package"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Package Price (£) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={packageData.price}
                        onChange={(e) => setPackageData(prev => ({...prev, price: e.target.value}))}
                        placeholder="e.g., 800"
                      />
                    </div>
                    <div>
                      <Label htmlFor="payoutFrequency">Payout Frequency</Label>
                      <Select 
                        value={packageData.payoutFrequency} 
                        onValueChange={(value: 'weekly' | 'monthly') => 
                          setPackageData(prev => ({...prev, payoutFrequency: value}))
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
                      <Label htmlFor="durationWeeks">Duration (Weeks)</Label>
                      <Input
                        id="durationWeeks"
                        type="number"
                        value={packageData.durationWeeks}
                        onChange={(e) => setPackageData(prev => ({...prev, durationWeeks: e.target.value}))}
                        placeholder="e.g., 12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="durationMonths">Duration (Months)</Label>
                      <Input
                        id="durationMonths"
                        type="number"
                        value={packageData.durationMonths}
                        onChange={(e) => setPackageData(prev => ({...prev, durationMonths: e.target.value}))}
                        placeholder="e.g., 3"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="paymentMode">Customer Payment Mode</Label>
                      <Select 
                        value={packageData.customerPaymentMode} 
                        onValueChange={(value: 'upfront' | 'installments') => 
                          setPackageData(prev => ({...prev, customerPaymentMode: value}))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upfront">Full Payment Upfront</SelectItem>
                          <SelectItem value="installments">Installment Payments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {packageData.customerPaymentMode === 'installments' && (
                      <div>
                        <Label htmlFor="installmentCount">Number of Installments</Label>
                        <Input
                          id="installmentCount"
                          type="number"
                          min="2"
                          max="12"
                          value={packageData.installmentCount}
                          onChange={(e) => setPackageData(prev => ({...prev, installmentCount: e.target.value}))}
                          placeholder="e.g., 3"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePackage}>
                      {editingPackage ? "Update Package" : "Create Package"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {localPackages.length > 0 ? (
            <div className="grid gap-4">
              {localPackages.map((pkg) => (
                <div key={pkg.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{pkg.name}</h4>
                        {pkg.sessions && (
                          <Badge variant="outline">{pkg.sessions} sessions</Badge>
                        )}
                        <Badge variant="secondary">
                          £{pkg.price}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDuration(pkg)}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {formatPaymentMode(pkg)}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Paid {pkg.payoutFrequency}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPackage(pkg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No packages configured</h3>
              <p className="text-muted-foreground mb-4">
                Create your first training package with payment terms
              </p>
                    <div className="flex gap-2">
                      <Button onClick={() => setIsCreating(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Package
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/trainer/profile-setup?tab=rates')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Basic Package Setup
                      </Button>
                    </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};