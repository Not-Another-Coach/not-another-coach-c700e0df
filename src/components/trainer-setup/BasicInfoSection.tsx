import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, Sparkles, User, Plus, X, Calendar } from "lucide-react";
import { SectionHeader } from './SectionHeader';

interface BasicInfoSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

export function BasicInfoSection({ formData, updateFormData, errors = {}, clearFieldError }: BasicInfoSectionProps) {
  const [dragOver, setDragOver] = useState(false);
  const [bioAIHelperOpen, setBioAIHelperOpen] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      // Create a file reader to get base64 data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateFormData({ profile_photo_url: result });
      };
      reader.readAsDataURL(file);
      
      // TODO: In production, upload to Supabase storage
      console.log("File uploaded:", file.name);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0] && files[0].type.startsWith('image/')) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const bioSuggestions = [
    "Helping busy professionals transform their bodies and minds through sustainable fitness",
    "Certified trainer specializing in strength building and confidence boosting for women",
    "Former athlete turned coach, passionate about making fitness accessible and enjoyable",
    "Evidence-based training with a focus on long-term health and movement quality"
  ];

  const handleBioSuggestion = (suggestion: string) => {
    updateFormData({ bio: suggestion });
    setBioAIHelperOpen(false);
  };

  const addMilestone = () => {
    const milestones = formData.professional_milestones || [];
    const newMilestone = { year: new Date().getFullYear().toString(), event: "" };
    updateFormData({ professional_milestones: [...milestones, newMilestone] });
  };

  const updateMilestone = (index: number, field: 'year' | 'event', value: string) => {
    const milestones = [...(formData.professional_milestones || [])];
    milestones[index] = { ...milestones[index], [field]: value };
    updateFormData({ professional_milestones: milestones });
  };

  const removeMilestone = (index: number) => {
    const milestones = formData.professional_milestones || [];
    const updated = milestones.filter((_: any, i: number) => i !== index);
    updateFormData({ professional_milestones: updated });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[User, Camera]}
        title="Basic Info"
        description="Set up your essential profile information and photo"
      />
      
      {/* Full Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => {
              updateFormData({ first_name: e.target.value });
              if (errors.first_name && clearFieldError) clearFieldError('first_name');
            }}
            placeholder="Enter your first name"
            className={`capitalize ${errors.first_name ? 'border-red-500' : ''}`}
          />
          {errors.first_name && (
            <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => {
              updateFormData({ last_name: e.target.value });
              if (errors.last_name && clearFieldError) clearFieldError('last_name');
            }}
            placeholder="Enter your last name"
            className={`capitalize ${errors.last_name ? 'border-red-500' : ''}`}
          />
          {errors.last_name && (
            <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* Profile Photo */}
      <div className="space-y-2">
        <Label>Profile Photo</Label>
        <Card className={`border-2 border-dashed transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}>
          <CardContent className="p-6">
            <div
              className="text-center"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {formData.profile_photo_url ? (
                <div className="space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-full bg-muted border overflow-hidden">
                    <img 
                      src={formData.profile_photo_url} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-change"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="photo-change" className="cursor-pointer">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </label>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => console.log("AI enhance coming soon")}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Enhance
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-full bg-muted border flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Drag & drop your photo here</p>
                    <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </label>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Square crop recommended • AI enhancement available
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Short Tagline */}
      <div className="space-y-2">
        <Label htmlFor="tagline">Short Tagline *</Label>
        <div className="relative">
          <Input
            id="tagline"
            value={formData.tagline}
            onChange={(e) => {
              updateFormData({ tagline: e.target.value });
              if (errors.tagline && clearFieldError) clearFieldError('tagline');
            }}
            placeholder="Helping busy women lift confidently at home"
            maxLength={100}
            className={errors.tagline ? 'border-red-500' : ''}
          />
          {errors.tagline && (
            <p className="text-sm text-red-500 mt-1">{errors.tagline}</p>
          )}
          <div className="absolute right-3 top-3 text-xs text-muted-foreground">
            {(formData.tagline || '').length}/100
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          A short, compelling statement that captures your coaching philosophy
        </p>
      </div>

      {/* Bio/About Me */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio">Bio/About Me *</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBioAIHelperOpen(!bioAIHelperOpen)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Helper
          </Button>
        </div>
        
        {bioAIHelperOpen && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium">Bio suggestions:</p>
              <div className="space-y-2">
                {bioSuggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground p-2 h-auto text-wrap leading-relaxed"
                    onClick={() => handleBioSuggestion(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => {
            updateFormData({ bio: e.target.value });
            if (errors.bio && clearFieldError) clearFieldError('bio');
          }}
          placeholder="Tell potential clients about your background, experience, and approach to training..."
          rows={6}
          className={`resize-none ${errors.bio ? 'border-red-500' : ''}`}
        />
        {errors.bio && (
          <p className="text-sm text-red-500 mt-1">{errors.bio}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Share your story, qualifications, and what makes you unique as a trainer
        </p>
      </div>

      {/* Professional Milestones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Professional Milestones</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Add key achievements and career milestones that showcase your professional journey
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addMilestone}>
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </div>
        
        {formData.professional_milestones && formData.professional_milestones.length > 0 && (
          <div className="space-y-3">
            {formData.professional_milestones.map((milestone: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                    <Input
                      placeholder="Year"
                      value={milestone.year}
                      onChange={(e) => updateMilestone(index, 'year', e.target.value)}
                      maxLength={4}
                    />
                    <Input
                      placeholder="Achievement or milestone event..."
                      value={milestone.event}
                      onChange={(e) => updateMilestone(index, 'event', e.target.value)}
                      className="md:col-span-3"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMilestone(index)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {(!formData.professional_milestones || formData.professional_milestones.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No milestones added yet. Share your professional achievements to build credibility.
              </p>
              <Button variant="outline" size="sm" onClick={addMilestone}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Milestone
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}