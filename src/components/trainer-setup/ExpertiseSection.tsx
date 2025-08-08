import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Monitor, Users, Globe, Target, Dumbbell } from "lucide-react";
import { SectionHeader } from './SectionHeader';

interface ExpertiseSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const specialtyTags = [
  "Weight Loss",
  "Strength Training", 
  "Pre/Postnatal",
  "Menopause Support",
  "CrossFit",
  "Rehabilitation",
  "Flexibility & Mobility",
  "Mindfulness & Wellness",
  "Nutrition Coaching",
  "HIIT Training",
  "Powerlifting",
  "Olympic Lifting",
  "Bodybuilding",
  "Functional Movement",
  "Sports Performance",
  "Injury Prevention",
  "Senior Fitness",
  "Youth Training",
  "Marathon Training",
  "Yoga",
  "Pilates",
  "Dance Fitness",
  "Boxing/Kickboxing",
  "Swimming"
];

const trainingTypes = [
  "1-on-1 Personal Training",
  "Small Group Training (2-4 people)",
  "Group Classes (5+ people)",
  "Online Coaching",
  "Hybrid Programs",
  "Nutrition Consulting",
  "Program Design",
  "Form Checks",
  "Workout Plans"
];

const languages = [
  "English",
  "Spanish", 
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Polish",
  "Russian",
  "Mandarin",
  "Cantonese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Swedish",
  "Norwegian",
  "Danish"
];

export function ExpertiseSection({ formData, updateFormData }: ExpertiseSectionProps) {
  const [deliveryFormat, setDeliveryFormat] = useState<'in-person' | 'online' | 'hybrid'>(
    formData.delivery_format || 'hybrid'
  );

  // Update form data when delivery format changes
  const handleDeliveryFormatChange = (format: 'in-person' | 'online' | 'hybrid') => {
    setDeliveryFormat(format);
    updateFormData({ delivery_format: format });
    
    // Clear location if switching to online-only
    if (format === 'online') {
      updateFormData({ location: 'Online Only' });
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const current = formData.specializations || [];
    const updated = current.includes(specialty)
      ? current.filter((s: string) => s !== specialty)
      : [...current, specialty];
    updateFormData({ specializations: updated });
  };

  const handleTrainingTypeToggle = (type: string) => {
    const current = formData.training_types || [];
    const updated = current.includes(type)
      ? current.filter((t: string) => t !== type)
      : [...current, type];
    updateFormData({ training_types: updated });
  };

  const handleLanguageToggle = (language: string) => {
    const current = formData.languages || [];
    const updated = current.includes(language)
      ? current.filter((l: string) => l !== language)
      : [...current, language];
    updateFormData({ languages: updated });
  };

  const removeSpecialty = (specialty: string) => {
    const current = formData.specializations || [];
    updateFormData({ specializations: current.filter((s: string) => s !== specialty) });
  };

  const removeTrainingType = (type: string) => {
    const current = formData.training_types || [];
    updateFormData({ training_types: current.filter((t: string) => t !== type) });
  };

  const removeLanguage = (language: string) => {
    const current = formData.languages || [];
    updateFormData({ languages: current.filter((l: string) => l !== language) });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Target, Dumbbell]}
        title="Expertise & Services"
        description="Define your specialties, training types, and service areas"
      />
      
      {/* Selected Specialties */}
      {formData.specializations && formData.specializations.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Specialties</Label>
          <div className="flex flex-wrap gap-2">
            {formData.specializations.map((specialty: string) => (
              <Badge
                key={specialty}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                <span>{specialty}</span>
                <button
                  onClick={() => removeSpecialty(specialty)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Specialties */}
      <div className="space-y-4">
        <Label>Specialties *</Label>
        <p className="text-sm text-muted-foreground">
          Select the areas where you have expertise and enjoy coaching
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
          {specialtyTags.map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2">
              <Checkbox
                id={specialty}
                checked={formData.specializations?.includes(specialty) || false}
                onCheckedChange={() => handleSpecialtyToggle(specialty)}
              />
              <Label htmlFor={specialty} className="text-sm cursor-pointer leading-tight">
                {specialty}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Training Types */}
      {formData.training_types && formData.training_types.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Training Types</Label>
          <div className="flex flex-wrap gap-2">
            {formData.training_types.map((type: string) => (
              <Badge
                key={type}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                <span>{type}</span>
                <button
                  onClick={() => removeTrainingType(type)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Training Types */}
      <div className="space-y-4">
        <Label>Training Types *</Label>
        <p className="text-sm text-muted-foreground">
          What types of training sessions do you offer?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {trainingTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={formData.training_types?.includes(type) || false}
                onCheckedChange={() => handleTrainingTypeToggle(type)}
              />
              <Label htmlFor={type} className="text-sm cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
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

      {/* Location (for in-person) */}
      {(deliveryFormat === 'in-person' || deliveryFormat === 'hybrid') && (
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateFormData({ location: e.target.value })}
              placeholder="Enter city, postcode, or area you serve"
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This helps clients find trainers in their area
          </p>
        </div>
      )}

      {/* Selected Languages */}
      {formData.languages && formData.languages.length > 0 && (
        <div className="space-y-2">
          <Label>Languages Spoken</Label>
          <div className="flex flex-wrap gap-2">
            {formData.languages.map((language: string) => (
              <Badge
                key={language}
                variant="outline"
                className="flex items-center gap-2 px-3 py-1"
              >
                <span>{language}</span>
                <button
                  onClick={() => removeLanguage(language)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      <div className="space-y-4">
        <Label>Languages Spoken (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Select languages you can coach in
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-40 overflow-y-auto">
          {languages.map((language) => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox
                id={language}
                checked={formData.languages?.includes(language) || false}
                onCheckedChange={() => handleLanguageToggle(language)}
              />
              <Label htmlFor={language} className="text-sm cursor-pointer">
                {language}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}