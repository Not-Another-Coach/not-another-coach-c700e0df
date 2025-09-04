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

  const [selectedTrainingTypeDelivery, setSelectedTrainingTypeDelivery] = useState<{[key: string]: string[]}>(
    formData.training_type_delivery || {}
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

  const handleTrainingTypeDeliveryToggle = (trainingTypeName: string, deliveryFormat: string) => {
    const currentDelivery = selectedTrainingTypeDelivery[trainingTypeName] || [];
    const updated = currentDelivery.includes(deliveryFormat)
      ? currentDelivery.filter(d => d !== deliveryFormat)
      : [...currentDelivery, deliveryFormat];
    
    const newDeliveryData = {
      ...selectedTrainingTypeDelivery,
      [trainingTypeName]: updated
    };
    
    setSelectedTrainingTypeDelivery(newDeliveryData);
    updateFormData({ training_type_delivery: newDeliveryData });
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
    const isCurrentlySelected = current.includes(trainingTypeName);
    
    if (isCurrentlySelected) {
      // Remove training type and its delivery data
      const updatedTypes = current.filter((t: string) => t !== trainingTypeName);
      const updatedDelivery = { ...selectedTrainingTypeDelivery };
      delete updatedDelivery[trainingTypeName];
      
      updateFormData({ training_types: updatedTypes, training_type_delivery: updatedDelivery });
      setSelectedTrainingTypeDelivery(updatedDelivery);
    } else {
      // Add training type
      const updatedTypes = [...current, trainingTypeName];
      updateFormData({ training_types: updatedTypes });
      
      // Track usage analytics
      if (trainingTypeId && user) {
        await trackTrainingTypeUsage(trainingTypeId, user.id);
      }
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
              <div className="space-y-4">
                {filteredTrainingTypes.map((trainingType) => {
                  const isSelected = formData.training_types?.includes(trainingType.name) || false;
                  const selectedDeliveryFormats = selectedTrainingTypeDelivery[trainingType.name] || [];
                  
                  return (
                    <div key={trainingType.id} className="space-y-3">
                      <button 
                        onClick={() => handleTrainingTypeToggle(trainingType.name, trainingType.id)}
                        className={`w-full p-4 rounded-lg border transition-colors text-left ${
                          isSelected 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={`text-sm block ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                              {trainingType.name}
                            </span>
                            {trainingType.description && (
                              <span className="text-xs text-muted-foreground mt-1 block">{trainingType.description}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isSelected ? 'Selected' : 'Click to select'}
                          </div>
                        </div>
                      </button>
                      
                      {isSelected && (
                        <div className="ml-4 p-4 bg-muted/30 rounded-lg">
                          <div className="mb-2">
                            <span className="text-sm font-medium">How do you deliver this training?</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {trainingType.delivery_formats.map((format) => {
                              const isDeliverySelected = selectedDeliveryFormats.includes(format);
                              return (
                                <button
                                  key={format}
                                  onClick={() => handleTrainingTypeDeliveryToggle(trainingType.name, format)}
                                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                    isDeliverySelected
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-background border border-border hover:bg-muted'
                                  }`}
                                >
                                  {format.charAt(0).toUpperCase() + format.slice(1)}
                                </button>
                              );
                            })}
                          </div>
                          {selectedDeliveryFormats.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Select at least one delivery format
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location */}
      {Object.values(selectedTrainingTypeDelivery).some(formats => formats.includes('in-person')) && (
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