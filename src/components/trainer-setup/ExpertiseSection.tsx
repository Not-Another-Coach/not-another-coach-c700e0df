import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Monitor, Users, Globe, Target, Dumbbell, Sparkles, Search, Plus, Send } from "lucide-react";
import { SectionHeader } from './SectionHeader';
import { useSpecialties, useSpecialtyCategories, useTrainingTypes, useCustomSpecialtyRequests, useSpecialtyAnalytics } from '@/hooks/useSpecialties';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ExpertiseSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function ExpertiseSection({ formData, updateFormData }: ExpertiseSectionProps) {
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useSpecialtyCategories();
  const { specialties, loading: specialtiesLoading } = useSpecialties();
  const { trainingTypes, loading: trainingTypesLoading } = useTrainingTypes();
  const { createRequest } = useCustomSpecialtyRequests();
  const { trackSpecialtyUsage, trackTrainingTypeUsage } = useSpecialtyAnalytics();

  const [deliveryFormat, setDeliveryFormat] = useState<'in-person' | 'online' | 'hybrid'>(
    formData.delivery_format || 'hybrid'
  );
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState('');
  const [trainingTypeSearchTerm, setTrainingTypeSearchTerm] = useState('');
  const [showCustomSpecialtyDialog, setShowCustomSpecialtyDialog] = useState(false);
  const [customSpecialtyForm, setCustomSpecialtyForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    justification: ''
  });

  // Update form data when delivery format changes
  const handleDeliveryFormatChange = (format: 'in-person' | 'online' | 'hybrid') => {
    setDeliveryFormat(format);
    updateFormData({ delivery_format: format });
    
    // Clear location if switching to online-only
    if (format === 'online') {
      updateFormData({ location: 'Online Only' });
    }
  };

  const handleSpecialtyToggle = async (specialtyName: string, specialtyId?: string) => {
    const current = formData.specializations || [];
    const updated = current.includes(specialtyName)
      ? current.filter((s: string) => s !== specialtyName)
      : [...current, specialtyName];
    updateFormData({ specializations: updated });

    // Track usage analytics if adding
    if (!current.includes(specialtyName) && specialtyId && user) {
      await trackSpecialtyUsage(specialtyId, user.id);
    }
  };

  const handleTrainingTypeToggle = async (trainingTypeName: string, trainingTypeId?: string) => {
    const current = formData.training_types || [];
    const updated = current.includes(trainingTypeName)
      ? current.filter((t: string) => t !== trainingTypeName)
      : [...current, trainingTypeName];
    updateFormData({ training_types: updated });

    // Track usage analytics if adding
    if (!current.includes(trainingTypeName) && trainingTypeId && user) {
      await trackTrainingTypeUsage(trainingTypeId, user.id);
    }
  };

  const handleRequestCustomSpecialty = async () => {
    try {
      await createRequest({
        requested_name: customSpecialtyForm.name,
        category_id: customSpecialtyForm.categoryId || undefined,
        description: customSpecialtyForm.description || undefined,
        justification: customSpecialtyForm.justification || undefined
      });

      setShowCustomSpecialtyDialog(false);
      setCustomSpecialtyForm({
        name: '',
        categoryId: '',
        description: '',
        justification: ''
      });

      toast({
        title: "Request Submitted",
        description: "Your custom specialty request has been submitted for admin review."
      });
    } catch (error) {
      console.error('Error submitting custom specialty request:', error);
    }
  };

  // Filter specialties and training types based on search
  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(specialtySearchTerm.toLowerCase()) ||
    (specialty.matching_keywords && specialty.matching_keywords.some(keyword => 
      keyword.toLowerCase().includes(specialtySearchTerm.toLowerCase())
    ))
  );

  const filteredTrainingTypes = trainingTypes.filter(type =>
    type.name.toLowerCase().includes(trainingTypeSearchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(trainingTypeSearchTerm.toLowerCase()))
  );

  const generateSpecializationDescription = () => {
    const selectedSpecialties = formData.specializations || [];
    if (selectedSpecialties.length === 0) return "Select specialties above to auto-generate";
    
    const mainSpecialties = selectedSpecialties.slice(0, 3);
    let description = `I specialise in ${mainSpecialties.join(", ")}`;
    
    if (selectedSpecialties.length > 3) {
      description += ` and ${selectedSpecialties.length - 3} other areas`;
    }
    
    description += ". My expertise allows me to create personalised programs that deliver real results for my clients.";
    
    updateFormData({ specialization_description: description });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Target, Dumbbell]}
        title="Expertise & Services"
        description="Define your specialties, training types, and service areas"
      />

      {/* Specialties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">What do you specialise in?</h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search specialties..."
                  value={specialtySearchTerm}
                  onChange={(e) => setSpecialtySearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={showCustomSpecialtyDialog} onOpenChange={setShowCustomSpecialtyDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Request New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Custom Specialty</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="specialty-name">Specialty Name</Label>
                      <Input
                        id="specialty-name"
                        value={customSpecialtyForm.name}
                        onChange={(e) => setCustomSpecialtyForm({...customSpecialtyForm, name: e.target.value})}
                        placeholder="e.g., Aquatic Therapy"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={customSpecialtyForm.categoryId} 
                        onValueChange={(value) => setCustomSpecialtyForm({...customSpecialtyForm, categoryId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="justification">Why do you need this specialty?</Label>
                      <Textarea
                        id="justification"
                        value={customSpecialtyForm.justification}
                        onChange={(e) => setCustomSpecialtyForm({...customSpecialtyForm, justification: e.target.value})}
                        placeholder="Explain why this specialty should be added..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCustomSpecialtyDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleRequestCustomSpecialty}
                        disabled={!customSpecialtyForm.name.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Request
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {specialtiesLoading || categoriesLoading ? (
              <div>Loading specialties...</div>
            ) : (
              <div className="space-y-6">
                {categories.map((category) => {
                  const categorySpecialties = filteredSpecialties.filter(s => s.category_id === category.id);
                  if (categorySpecialties.length === 0) return null;

                  return (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        {category.description && (
                          <span className="text-sm text-muted-foreground">— {category.description}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categorySpecialties.map((specialty) => {
                          const isSelected = formData.specializations?.includes(specialty.name) || false;
                          return (
                            <button 
                              key={specialty.id} 
                              onClick={() => handleSpecialtyToggle(specialty.name, specialty.id)}
                              className={`p-3 rounded-lg border transition-colors text-left ${
                                isSelected 
                                  ? 'border-primary bg-primary/10 text-primary font-medium' 
                                  : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <span className="text-sm">{specialty.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Training Types */}
      <div className="space-y-4">
        <Label>Training Types *</Label>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search training types..."
                  value={trainingTypeSearchTerm}
                  onChange={(e) => setTrainingTypeSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {trainingTypesLoading ? (
              <div>Loading training types...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTrainingTypes.map((trainingType) => {
                  const isSelected = formData.training_types?.includes(trainingType.name) || false;
                  return (
                    <button 
                      key={trainingType.id} 
                      onClick={() => handleTrainingTypeToggle(trainingType.name, trainingType.id)}
                      className={`p-4 rounded-lg border transition-colors text-left ${
                        isSelected 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div>
                        <span className={`text-sm block ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                          {trainingType.name}
                        </span>
                        {trainingType.description && (
                          <span className="text-xs text-muted-foreground mt-1 block">{trainingType.description}</span>
                        )}
                        <div className="flex gap-1 mt-2">
                          {trainingType.delivery_formats.map((format) => (
                            <Badge key={format} variant="secondary" className="text-xs capitalize">
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delivery Format */}
      <div className="space-y-4">
        <Label>Delivery Format *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`cursor-pointer transition-colors ${deliveryFormat === 'in-person' ? 'border-primary bg-primary/5' : ''}`}>
            <CardContent 
              className="p-4 text-center"
              onClick={() => handleDeliveryFormatChange('in-person')}
            >
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">In-Person</p>
              <p className="text-xs text-muted-foreground">Face-to-face training</p>
            </CardContent>
          </Card>
          
          <Card className={`cursor-pointer transition-colors ${deliveryFormat === 'online' ? 'border-primary bg-primary/5' : ''}`}>
            <CardContent 
              className="p-4 text-center"
              onClick={() => handleDeliveryFormatChange('online')}
            >
              <Monitor className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Online</p>
              <p className="text-xs text-muted-foreground">Virtual coaching</p>
            </CardContent>
          </Card>
          
          <Card className={`cursor-pointer transition-colors ${deliveryFormat === 'hybrid' ? 'border-primary bg-primary/5' : ''}`}>
            <CardContent 
              className="p-4 text-center"
              onClick={() => handleDeliveryFormatChange('hybrid')}
            >
              <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Hybrid</p>
              <p className="text-xs text-muted-foreground">Both options</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Location */}
      {(deliveryFormat === 'in-person' || deliveryFormat === 'hybrid') && (
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => updateFormData({ location: e.target.value })}
              placeholder="Enter city, postcode, or area you serve"
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Auto-generated description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="specialization_description">What I specialise in</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSpecializationDescription}
            disabled={!formData.specializations?.length}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Auto-Generate
          </Button>
        </div>
        <Textarea
          id="specialization_description"
          value={formData.specialization_description || ''}
          onChange={(e) => updateFormData({ specialization_description: e.target.value })}
          placeholder="Describe what you specialise in and your unique approach..."
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  );
}