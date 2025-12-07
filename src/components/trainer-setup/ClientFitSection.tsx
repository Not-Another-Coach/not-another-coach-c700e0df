import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Users, Heart, Target, Zap, Sparkles, RefreshCw } from "lucide-react";
import { AIDescriptionHelper } from "./AIDescriptionHelper";
import { SectionHeader } from './SectionHeader';

interface ClientFitSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const idealClientTypes = [
  "Complete Beginners",
  "Busy Parents", 
  "Working Professionals",
  "Seniors (55+)",
  "Athletes",
  "Post-Rehabilitation",
  "Weight Loss Focused",
  "Strength Building",
  "Women Only",
  "Men Only",
  "LGBTQ+ Friendly",
  "Pre/Postnatal",
  "Teenagers",
  "Body Positive Focus"
];

const coachingStyles = [
  { 
    id: "tough-love", 
    label: "Tough Love", 
    icon: Zap, 
    description: "Direct, challenging, results-driven",
    emoji: "🎯" 
  },
  { 
    id: "calm", 
    label: "Calm & Patient", 
    icon: Heart, 
    description: "Gentle, understanding, supportive",
    emoji: "🧘" 
  },
  { 
    id: "encouraging", 
    label: "Encouraging", 
    icon: Heart, 
    description: "Motivational, positive, uplifting",
    emoji: "💬" 
  },
  { 
    id: "structured", 
    label: "Structured", 
    icon: Target, 
    description: "Systematic, data-driven, organized",
    emoji: "📊" 
  },
  { 
    id: "fun", 
    label: "Fun & Energetic", 
    icon: Zap, 
    description: "Playful, dynamic, engaging",
    emoji: "🎉" 
  },
  { 
    id: "holistic", 
    label: "Holistic", 
    icon: Heart, 
    description: "Mind-body connection, lifestyle focused",
    emoji: "🌿" 
  }
];

export function ClientFitSection({ formData, updateFormData }: ClientFitSectionProps) {
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  
  // Initialize arrays if they don't exist (same pattern as other sections)
  useEffect(() => {
    if (!formData.ideal_client_types) {
      updateFormData({ ideal_client_types: [] });
    }
    if (!formData.coaching_style) {
      updateFormData({ coaching_style: [] });
    }
    if (!formData.preferred_client_genders) {
      updateFormData({ preferred_client_genders: ["all"] });
    }
  }, [formData.ideal_client_types, formData.coaching_style, formData.preferred_client_genders, updateFormData]);

  const clientGenderOptions = [
    { id: "all", label: "All Genders", description: "I work with clients of any gender" },
    { id: "male", label: "Male", description: "Male-identifying clients" },
    { id: "female", label: "Female", description: "Female-identifying clients" },
    { id: "non-binary", label: "Non-binary", description: "Non-binary clients" },
  ];

  const handleClientGenderToggle = (genderId: string) => {
    const current = formData.preferred_client_genders || ["all"];
    
    if (genderId === "all") {
      // If selecting "all", clear other selections
      updateFormData({ preferred_client_genders: ["all"] });
    } else {
      // If selecting specific gender, remove "all" and toggle this gender
      let updated = current.filter((g: string) => g !== "all");
      
      if (updated.includes(genderId)) {
        updated = updated.filter((g: string) => g !== genderId);
      } else {
        updated = [...updated, genderId];
      }
      
      // If no specific genders selected, default to "all"
      if (updated.length === 0) {
        updated = ["all"];
      }
      
      updateFormData({ preferred_client_genders: updated });
    }
  };
  
  const handleClientTypeToggle = (clientType: string) => {
    const current = formData.ideal_client_types || [];
    const updated = current.includes(clientType)
      ? current.filter((type: string) => type !== clientType)
      : [...current, clientType];
    updateFormData({ ideal_client_types: updated });
  };

  const handleCoachingStyleToggle = (style: string) => {
    const current = formData.coaching_style || [];
    const updated = current.includes(style)
      ? current.filter((s: string) => s !== style)
      : [...current, style];
    updateFormData({ coaching_style: updated });
  };

  const removeClientType = (clientType: string) => {
    const current = formData.ideal_client_types || [];
    updateFormData({ ideal_client_types: current.filter((type: string) => type !== clientType) });
  };

  const removeCoachingStyle = (style: string) => {
    const current = formData.coaching_style || [];
    updateFormData({ coaching_style: current.filter((s: string) => s !== style) });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Users, Heart]}
        title="Client Fit Preferences"
        description="Define your ideal clients and coaching style to attract the perfect matches"
      />
      
      {/* Selected Client Types */}
      {formData.ideal_client_types && formData.ideal_client_types.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Ideal Clients</Label>
          <div className="flex flex-wrap gap-2">
            {formData.ideal_client_types.map((clientType: string) => (
              <Badge
                key={clientType}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                <span>{clientType}</span>
                <button
                  onClick={() => removeClientType(clientType)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Ideal Client Type */}
      <div className="space-y-4">
        <div>
          <Label>Ideal Client Type *</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Who do you most enjoy working with and get the best results for?
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {idealClientTypes.map((clientType) => (
            <Button
              key={clientType}
              variant={formData.ideal_client_types?.includes(clientType) ? "default" : "outline"}
              size="sm"
              onClick={() => handleClientTypeToggle(clientType)}
              className="h-auto p-3 text-xs"
            >
              {clientType}
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Coaching Styles */}
      {formData.coaching_style && formData.coaching_style.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Coaching Styles</Label>
          <div className="flex flex-wrap gap-2">
            {formData.coaching_style.map((style: string) => {
              const styleObj = coachingStyles.find(s => s.id === style);
              return (
                <Badge
                  key={style}
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  <span>{styleObj?.emoji} {styleObj?.label}</span>
                  <button
                    onClick={() => removeCoachingStyle(style)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Coaching Style */}
      <div className="space-y-4">
        <div>
          <Label>Coaching Style *</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select the approaches that best describe your coaching personality
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coachingStyles.map((style) => {
            const isSelected = formData.coaching_style?.includes(style.id);
            return (
              <Card 
                key={style.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => handleCoachingStyleToggle(style.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{style.emoji}</div>
                    <div className="flex-1">
                      <p className="font-medium">{style.label}</p>
                      <p className="text-sm text-muted-foreground">{style.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Preferred Client Genders */}
      <div className="space-y-4">
        <div>
          <Label>Client Gender Preferences</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select which client genders you prefer to work with
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {clientGenderOptions.map((option) => {
            const isSelected = formData.preferred_client_genders?.includes(option.id);
            return (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => handleClientGenderToggle(option.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => handleClientGenderToggle(option.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{option.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Ideal Client Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="ideal_client_personality">Describe Your Ideal Client (Optional)</Label>
              <Button
                variant="ai"
                size="sm"
                onClick={() => setShowAIHelper(!showAIHelper)}
                disabled={isImproving || (!formData.ideal_client_personality?.trim() && 
                  (!formData.ideal_client_types?.length && !formData.coaching_style?.length))}
              >
                {isImproving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {formData.ideal_client_personality?.trim() ? 'Improve with AI' : 'Generate with AI'}
                  </>
                )}
              </Button>
        </div>

        {showAIHelper && (
          <AIDescriptionHelper
            selectedClientTypes={formData.ideal_client_types || []}
            selectedCoachingStyles={formData.coaching_style || []}
            currentDescription={formData.ideal_client_personality || ""}
            autoGenerate
            onGeneratingChange={setIsImproving}
            onSuggestionSelect={(suggestion) => {
              updateFormData({ ideal_client_personality: suggestion });
              setShowAIHelper(false);
            }}
          />
        )}
        
        <Textarea
          id="ideal_client_personality"
          value={formData.ideal_client_personality}
          onChange={(e) => updateFormData({ ideal_client_personality: e.target.value })}
          placeholder="e.g., Motivated beginners who are committed to consistency and open to lifestyle changes..."
          rows={3}
          className="resize-none"
        />
      </div>


    </div>
  );
}