import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ExternalLink, DollarSign, PoundSterling, Euro, Calendar, Sparkles } from "lucide-react";

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
}

export function RatesSection({ formData, updateFormData, errors }: RatesSectionProps) {
  const [currency, setCurrency] = useState<'GBP' | 'USD' | 'EUR'>('GBP');
  const [selectedRateTypes, setSelectedRateTypes] = useState<('hourly' | 'class' | 'monthly')[]>(
    formData.selected_rate_types || ['hourly']
  );
  const [packages, setPackages] = useState<TrainingPackage[]>(formData.package_options || []);
  const [communicationAIHelperOpen, setCommunicationAIHelperOpen] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    sessions: "",
    price: "",
    description: "",
    terms: "",
    inclusions: [] as string[]
  });

  const addPackage = () => {
    if (newPackage.name && newPackage.price && newPackage.description) {
      const trainingPackage: TrainingPackage = {
        id: Date.now().toString(),
        name: newPackage.name,
        sessions: newPackage.sessions ? parseInt(newPackage.sessions) : undefined,
        price: parseFloat(newPackage.price),
        currency,
        description: newPackage.description
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
        inclusions: []
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

      {/* Session Rates */}
      <div className="space-y-4">
        <div>
          <Label>Session Rates</Label>
          <p className="text-sm text-muted-foreground">
            Set your rates for different types of training sessions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">1-on-1 Personal Training *</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-muted-foreground">
                {currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}
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
              Your rate per hour for 1-on-1 sessions
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class_rate">Group/Class Rate</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-muted-foreground">
                {currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}
              </div>
              <Input
                id="class_rate"
                type="number"
                value={formData.class_rate || ""}
                onChange={(e) => updateFormData({ class_rate: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="25"
                className="pl-8"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your rate per person for group sessions
            </p>
          </div>
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
                         {pkg.sessions && (
                           <Badge variant="outline">{pkg.sessions} sessions</Badge>
                         )}
                         <Badge variant="secondary">
                           {pkg.currency === 'GBP' ? '£' : pkg.currency === 'USD' ? '$' : '€'}{pkg.price}
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
      </div>

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
    </div>
  );
}
