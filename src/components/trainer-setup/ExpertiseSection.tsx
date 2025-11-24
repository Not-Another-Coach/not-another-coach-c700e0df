import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Monitor, Users, Globe, Target, Dumbbell, Sparkles, Search, Plus, Send, CheckCircle, Clock, X } from "lucide-react";
import { SectionHeader } from './SectionHeader';
import { useSpecialties, useSpecialtyCategories, useTrainingTypes, useCustomSpecialtyRequests, useTrainerCustomSpecialtyRequests, useSpecialtyAnalytics } from '@/hooks/useSpecialties';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { LocationAutocompleteField } from "@/components/ui/LocationAutocompleteField";

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
  const { requests: customSpecialtyRequests = [] } = useTrainerCustomSpecialtyRequests();
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

  // Sync selectedTrainingTypeDelivery when formData.training_type_delivery changes
  useEffect(() => {
    if (formData.training_type_delivery) {
      setSelectedTrainingTypeDelivery(formData.training_type_delivery);
    } else if (formData.training_types?.length > 0 && Object.keys(formData.training_type_delivery || {}).length === 0) {
      // Backward compatibility: if training_types exist but training_type_delivery is empty,
      // derive default delivery formats (in-person for all)
      const defaultDelivery: {[key: string]: string[]} = {};
      formData.training_types.forEach((type: string) => {
        defaultDelivery[type] = ['in-person'];
      });
      setSelectedTrainingTypeDelivery(defaultDelivery);
      updateFormData({ training_type_delivery: defaultDelivery });
    }
  }, [formData.training_type_delivery, formData.training_types]);

  const handleTrainingTypeDeliveryToggle = async (trainingTypeName: string, deliveryFormat: string, trainingTypeId?: string) => {
    const currentDelivery = selectedTrainingTypeDelivery[trainingTypeName] || [];
    const isDeliverySelected = currentDelivery.includes(deliveryFormat);
    
    let updated: string[];
    let newTrainingTypes = formData.training_types || [];
    
    if (isDeliverySelected) {
      // Remove delivery format
      updated = currentDelivery.filter(d => d !== deliveryFormat);
      
      // If no delivery formats left, remove training type entirely
      if (updated.length === 0) {
        newTrainingTypes = newTrainingTypes.filter((t: string) => t !== trainingTypeName);
      }
    } else {
      // Add delivery format
      updated = [...currentDelivery, deliveryFormat];
      
      // Add training type if not already present
      if (!newTrainingTypes.includes(trainingTypeName)) {
        newTrainingTypes = [...newTrainingTypes, trainingTypeName];
        
        // Track usage analytics for new training type
        if (trainingTypeId && user) {
          await trackTrainingTypeUsage(trainingTypeId, user.id);
        }
      }
    }
    
    const newDeliveryData = {
      ...selectedTrainingTypeDelivery,
      [trainingTypeName]: updated
    };
    
    // Remove empty entries from delivery data
    if (updated.length === 0) {
      delete newDeliveryData[trainingTypeName];
    }
    
    setSelectedTrainingTypeDelivery(newDeliveryData);
    updateFormData({ 
      training_types: newTrainingTypes,
      training_type_delivery: newDeliveryData 
    });
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

            {/* Display pending custom specialty requests */}
            {customSpecialtyRequests.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-3">Pending Specialty Requests:</h4>
                <div className="flex flex-wrap gap-2">
                  {customSpecialtyRequests.map((request) => (
                    <Badge
                      key={`custom-${request.id}`}
                      variant={
                        request.status === 'approved' ? 'default' :
                        request.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                      className="flex items-center gap-2 px-3 py-1"
                    >
                      <span>{request.requested_name}</span>
                      {request.status === 'approved' && (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      )}
                      {request.status === 'pending' && (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      {request.status === 'rejected' && (
                        <X className="w-3 h-3 text-red-600" />
                      )}
                      <Badge 
                        variant="outline" 
                        className="text-xs ml-1 bg-background"
                      >
                        {request.status}
                      </Badge>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

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
                            <Button
                              key={specialty.id}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleSpecialtyToggle(specialty.name, specialty.id)}
                              className="justify-start text-left h-auto py-3 px-3 whitespace-normal"
                            >
                              {specialty.name}
                            </Button>
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
              <div className="space-y-3">
                {filteredTrainingTypes.map((trainingType) => {
                  const selectedDeliveryFormats = selectedTrainingTypeDelivery[trainingType.name] || [];
                  const hasAnyDeliverySelected = selectedDeliveryFormats.length > 0;
                  
                  return (
                    <div 
                      key={trainingType.id} 
                      className={`p-4 rounded-lg border transition-colors ${
                        hasAnyDeliverySelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {hasAnyDeliverySelected && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <div>
                              <span className={`text-sm block ${hasAnyDeliverySelected ? 'font-semibold text-primary' : 'font-medium'}`}>
                                {trainingType.name}
                              </span>
                              {trainingType.description && (
                                <span className="text-xs text-muted-foreground mt-1 block">
                                  {trainingType.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {trainingType.delivery_formats.map((format) => {
                            const isDeliverySelected = selectedDeliveryFormats.includes(format);
                            return (
                              <Button
                                key={format}
                                variant={isDeliverySelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleTrainingTypeDeliveryToggle(trainingType.name, format, trainingType.id)}
                                className="h-8 px-3 text-xs"
                              >
                                {format.charAt(0).toUpperCase() + format.slice(1)}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
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
        <LocationAutocompleteField
          value={formData.location || ''}
          onChange={(value) => updateFormData({ location: value })}
        />
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