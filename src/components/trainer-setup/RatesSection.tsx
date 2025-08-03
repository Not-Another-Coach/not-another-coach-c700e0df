import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ExternalLink, DollarSign, PoundSterling } from "lucide-react";

interface RatesSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

interface TrainingPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
}

export function RatesSection({ formData, updateFormData }: RatesSectionProps) {
  const [currency, setCurrency] = useState<'GBP' | 'USD'>('GBP');
  const [packages, setPackages] = useState<TrainingPackage[]>(formData.package_options || []);
  const [newPackage, setNewPackage] = useState({
    name: "",
    price: "",
    description: ""
  });

  const addPackage = () => {
    if (newPackage.name && newPackage.price && newPackage.description) {
      const trainingPackage: TrainingPackage = {
        id: Date.now().toString(),
        name: newPackage.name,
        price: parseFloat(newPackage.price),
        currency,
        description: newPackage.description
      };
      
      const updatedPackages = [...packages, trainingPackage];
      setPackages(updatedPackages);
      updateFormData({ package_options: updatedPackages });
      
      setNewPackage({
        name: "",
        price: "",
        description: ""
      });
    }
  };

  const removePackage = (id: string) => {
    const updatedPackages = packages.filter(pkg => pkg.id !== id);
    setPackages(updatedPackages);
    updateFormData({ package_options: updatedPackages });
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

  return (
    <div className="space-y-6">
      {/* Currency Toggle */}
      <div className="space-y-2">
        <Label>Currency</Label>
        <div className="flex items-center gap-4">
          <Button
            variant={currency === 'GBP' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrency('GBP')}
            className="flex items-center gap-2"
          >
            <Pound className="h-4 w-4" />
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
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="space-y-2">
        <Label htmlFor="hourly_rate">Hourly Rate *</Label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-muted-foreground">
            {currency === 'GBP' ? '£' : '$'}
          </div>
          <Input
            id="hourly_rate"
            type="number"
            value={formData.hourly_rate || ""}
            onChange={(e) => updateFormData({ hourly_rate: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="50"
            className="pl-8"
            min="0"
            step="0.01"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Your standard rate for 1-on-1 personal training sessions
        </p>
      </div>

      {/* Existing Packages */}
      {packages.length > 0 && (
        <div className="space-y-4">
          <Label>Training Packages</Label>
          <div className="space-y-3">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{pkg.name}</h4>
                        <Badge variant="secondary">
                          {pkg.currency === 'GBP' ? '£' : '$'}{pkg.price}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePackage(pkg.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add New Package */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Training Package</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="package_name">Package Name</Label>
            <Input
              id="package_name"
              value={newPackage.name}
              onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
              placeholder="e.g., 4-Week Transformation Package"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="package_price">Price</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-muted-foreground">
                {currency === 'GBP' ? '£' : '$'}
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
              placeholder="Describe what's included in this package..."
              rows={3}
              className="resize-none"
            />
          </div>
          
          <Button 
            onClick={addPackage}
            disabled={!newPackage.name || !newPackage.price || !newPackage.description}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </CardContent>
      </Card>

      {/* Discovery Call */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Free Discovery Call</Label>
            <p className="text-sm text-muted-foreground">
              Offer a 15-minute consultation call to potential clients
            </p>
          </div>
          <Switch
            checked={formData.free_discovery_call || false}
            onCheckedChange={(checked) => updateFormData({ free_discovery_call: checked })}
          />
        </div>

        {formData.free_discovery_call && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calendar_link">Booking Link</Label>
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
              </div>
              <p className="text-xs text-green-700">
                💡 Popular booking platforms: Calendly, Acuity Scheduling, Square Appointments
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pricing Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💰 Pricing Tips</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Research local market rates in your area</li>
            <li>• Consider your experience level and unique qualifications</li>
            <li>• Package deals often provide better value for clients and higher revenue for you</li>
            <li>• Discovery calls help build trust and can increase conversion rates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
