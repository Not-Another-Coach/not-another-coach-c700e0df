import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AIDescriptionHelperProps {
  selectedClientTypes: string[];
  selectedCoachingStyles: string[];
  currentDescription: string;
  onSuggestionSelect: (suggestion: string) => void;
  fieldType?: 'tagline' | 'how_started' | 'philosophy' | 'bio';
  autoGenerate?: boolean;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

export function AIDescriptionHelper({ 
  selectedClientTypes, 
  selectedCoachingStyles, 
  currentDescription,
  onSuggestionSelect,
  fieldType = 'bio',
  autoGenerate = false,
  onGeneratingChange,
}: AIDescriptionHelperProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = () => {
    setIsGenerating(true);
    onGeneratingChange?.(true);
    
    // Simulate AI generation based on selections and field type
    setTimeout(() => {
      const baseSuggestions = currentDescription.trim()
        ? generateImprovedSuggestions(currentDescription, fieldType, selectedClientTypes, selectedCoachingStyles)
        : generatePersonalisedSuggestions(selectedClientTypes, selectedCoachingStyles, fieldType);
      setSuggestions(baseSuggestions);
      setIsGenerating(false);
      onGeneratingChange?.(false);
    }, 1500);
  };

  // Auto-generate when helper opens in Improve mode
  useEffect(() => {
    if (autoGenerate && currentDescription.trim().length > 0 && suggestions.length === 0 && !isGenerating) {
      generateSuggestions();
    }
  }, [autoGenerate]);

  const generatePersonalisedSuggestions = (clientTypes: string[], coachingStyles: string[], fieldType: string): string[] => {
    const suggestions = [];
    
    const fieldTemplates = getFieldTemplates(fieldType);
    const primaryClient = clientTypes[0]?.toLowerCase() || 'clients';
    const primaryStyle = getStyleDescription(coachingStyles[0] || '');
    
    // Generate suggestions based on selections and field type
    if (clientTypes.length > 0 || coachingStyles.length > 0) {
      fieldTemplates.personalised.forEach(template => {
        const suggestion = template
          .replace('{CLIENT_TYPE}', primaryClient)
          .replace('{COACHING_STYLE}', primaryStyle);
        suggestions.push(suggestion);
      });
    } else {
      suggestions.push(...fieldTemplates.fallback);
    }

    return suggestions.slice(0, 4);
  };

  const generateImprovedSuggestions = (text: string, fieldType: string, clientTypes: string[], coachingStyles: string[]): string[] => {
    const improvements = [];
    
    // Create different improvement variations
    const clarityImprovement = enhanceTextClarity(text);
    if (clarityImprovement && clarityImprovement !== text) {
      improvements.push(clarityImprovement);
    }
    
    const professionalImprovement = enhanceTextProfessionalism(text);
    if (professionalImprovement && professionalImprovement !== text) {
      improvements.push(professionalImprovement);
    }
    
    const impactImprovement = enhanceTextImpact(text, fieldType);
    if (impactImprovement && impactImprovement !== text) {
      improvements.push(impactImprovement);
    }
    
    // Add personalisation if selections are available
    if (clientTypes.length > 0 || coachingStyles.length > 0) {
      const personalisedImprovement = personaliseText(text, clientTypes, coachingStyles, fieldType);
      if (personalisedImprovement && personalisedImprovement !== text) {
        improvements.push(personalisedImprovement);
      }
    }
    
    // If no meaningful improvements were generated, create some alternative versions
    if (improvements.length === 0) {
      improvements.push(
        ...createAlternativeVersions(text, fieldType)
      );
    }
    
    // Remove duplicates and ensure uniqueness
    const uniqueImprovements = improvements.filter((suggestion, index, arr) => 
      suggestion && suggestion !== text && arr.indexOf(suggestion) === index
    );
    
    return uniqueImprovements.slice(0, 4);
  };

  const createAlternativeVersions = (text: string, fieldType: string): string[] => {
    const alternatives = [];
    
    // Make it more concise
    if (text.length > 50) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      if (sentences.length > 1) {
        alternatives.push(sentences[0].trim() + '.');
      }
    }
    
    // Make it more engaging
    if (!text.toLowerCase().includes('help') && !text.toLowerCase().includes('support')) {
      alternatives.push(`I help clients ${text.toLowerCase().replace(/^i\s+/i, '').replace(/^am\s+/i, 'achieve ')}`);
    }
    
    // Add field-specific improvements
    switch (fieldType) {
      case 'tagline':
        if (text.length > 20) {
          alternatives.push(text.split(' ').slice(0, 8).join(' '));
        }
        break;
      case 'bio':
        if (!text.toLowerCase().includes('experience')) {
          alternatives.push(`With proven experience, ${text.toLowerCase()}`);
        }
        break;
    }
    
    return alternatives.filter(alt => alt && alt !== text);
  };

  const getFieldTemplates = (fieldType: string) => {
    const templates = {
      tagline: {
        personalised: [
          "Empowering {CLIENT_TYPE} through {COACHING_STYLE} fitness coaching",
          "Transforming {CLIENT_TYPE} with {COACHING_STYLE} training methods",
          "Your {COACHING_STYLE} trainer for {CLIENT_TYPE} success",
          "Helping {CLIENT_TYPE} thrive with {COACHING_STYLE} approach"
        ],
        fallback: [
          "Transforming lives through personalised fitness coaching",
          "Your partner in fitness, strength, and confidence",
          "Making fitness achievable, sustainable, and enjoyable",
          "Empowering you to become your strongest self"
        ]
      },
      how_started: {
        personalised: [
          "My journey began when I realised how much {CLIENT_TYPE} needed {COACHING_STYLE} support in their fitness journey.",
          "After years of working with {CLIENT_TYPE}, I discovered the power of {COACHING_STYLE} coaching to create lasting change.",
          "It started with my passion for helping {CLIENT_TYPE} overcome their fitness challenges through {COACHING_STYLE} methods.",
          "My story began when I saw firsthand how {COACHING_STYLE} training could transform the lives of {CLIENT_TYPE}."
        ],
        fallback: [
          "My fitness journey started with my own transformation - from struggling with consistency to finding my passion for helping others.",
          "It began when I realised that fitness isn't just about physical strength, but about building confidence and resilience.",
          "My path to becoming a trainer started when I discovered how much I loved helping people overcome their fitness challenges.",
          "After my own fitness transformation, I knew I wanted to help others experience that same life-changing journey."
        ]
      },
      philosophy: {
        personalised: [
          "I believe every {CLIENT_TYPE} deserves {COACHING_STYLE} guidance that meets them where they are and helps them grow.",
          "My philosophy centres on providing {CLIENT_TYPE} with {COACHING_STYLE} support that creates sustainable, lasting change.",
          "I'm committed to helping {CLIENT_TYPE} through {COACHING_STYLE} methods that honour their unique needs and goals.",
          "My approach with {CLIENT_TYPE} is rooted in {COACHING_STYLE} principles that build both strength and confidence."
        ],
        fallback: [
          "I believe fitness should be sustainable, enjoyable, and tailored to each individual's unique needs and lifestyle.",
          "My philosophy is simple: meet you where you are, celebrate every victory, and build habits that last a lifetime.",
          "I'm committed to creating a supportive environment where you can challenge yourself while feeling confident and empowered.",
          "Fitness is a journey, not a destination. I'm here to guide you with patience, expertise, and genuine care."
        ]
      },
      bio: {
        personalised: [
          "I specialise in helping {CLIENT_TYPE} achieve their fitness goals through {COACHING_STYLE} approach.",
          "As a trainer focused on {CLIENT_TYPE}, I bring a {COACHING_STYLE} methodology to every session.",
          "I'm passionate about working with {CLIENT_TYPE} using {COACHING_STYLE} techniques that deliver real results.",
          "My expertise lies in supporting {CLIENT_TYPE} through {COACHING_STYLE} training methods."
        ],
        fallback: [
          "I'm a dedicated personal trainer committed to helping clients achieve sustainable fitness results through personalised training programmes.",
          "With years of experience in fitness coaching, I focus on creating positive, supportive environments where clients can thrive.",
          "I believe in making fitness accessible and enjoyable for everyone, regardless of their starting point or goals.",
          "My approach combines evidence-based training methods with genuine care for each client's individual journey."
        ]
      }
    };
    
    return templates[fieldType as keyof typeof templates] || templates.bio;
  };

  const enhanceTextClarity = (text: string): string => {
    if (!text || text.length < 10) return text;
    
    let enhanced = text
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => punct + ' ' + letter.toUpperCase())
      .replace(/\bi\s/gi, 'I ')
      .replace(/\bim\b/gi, "I'm")
      .trim();
    
    // Ensure it ends with proper punctuation
    if (enhanced && !enhanced.match(/[.!?]$/)) {
      enhanced += '.';
    }
    
    return enhanced;
  };

  const enhanceTextProfessionalism = (text: string): string => {
    if (!text || text.length < 10) return text;
    
    let professional = text
      .replace(/\bawesome\b/gi, 'excellent')
      .replace(/\bgreat\b/gi, 'exceptional')
      .replace(/\bokay\b/gi, 'effective')
      .replace(/\bstuff\b/gi, 'methods')
      .replace(/\bguys\b/gi, 'clients')
      .replace(/\bthing\b/gi, 'approach');
    
    // Add professional closing if text is short
    if (professional.length < 60 && !professional.toLowerCase().includes('dedicated') && !professional.toLowerCase().includes('committed')) {
      professional += " I'm committed to delivering exceptional results.";
    }
    
    return professional;
  };

  const enhanceTextImpact = (text: string, fieldType: string): string => {
    if (!text || text.length < 10) return text;
    
    // Add impactful words and phrases
    let impactful = text
      .replace(/\bhelp\b/gi, 'empower')
      .replace(/\bwork with\b/gi, 'support')
      .replace(/\bshow\b/gi, 'guide')
      .replace(/\btrain\b/gi, 'transform');
    
    // Add field-specific impact
    const impactEnhancements = {
      tagline: "Transform your fitness journey",
      how_started: "This pivotal moment shaped my approach to",
      philosophy: "I firmly believe that",
      bio: "My mission is to"
    };
    
    const enhancement = impactEnhancements[fieldType as keyof typeof impactEnhancements];
    
    // Only add enhancement if text is relatively short and doesn't already contain impactful language
    if (impactful.length < 80 && enhancement && !impactful.toLowerCase().includes('transform') && !impactful.toLowerCase().includes('mission')) {
      if (fieldType === 'tagline') {
        impactful = `${enhancement}: ${impactful.toLowerCase()}`;
      } else {
        impactful = `${enhancement} ${impactful.toLowerCase()}`;
      }
    }
    
    return impactful;
  };

  const personaliseText = (text: string, clientTypes: string[], coachingStyles: string[], fieldType: string): string => {
    if (!text || text.length < 10) return text;
    
    const primaryClient = clientTypes[0]?.toLowerCase() || 'clients';
    const primaryStyle = getStyleDescription(coachingStyles[0] || '');
    
    // Create personalised versions based on field type
    switch (fieldType) {
      case 'tagline':
        return `${primaryStyle} coaching for ${primaryClient}`;
      case 'how_started':
        return `${text} Working with ${primaryClient} taught me the value of ${primaryStyle} guidance.`;
      case 'philosophy':
        return `${text} This is especially important when working with ${primaryClient} through ${primaryStyle} methods.`;
      case 'bio':
        return `${text} I specialise in ${primaryStyle} coaching for ${primaryClient}.`;
      default:
        return `${text} I focus on ${primaryStyle} approaches for ${primaryClient}.`;
    }
  };

  const getStyleDescription = (style: string): string => {
    const styleMap: Record<string, string> = {
      'tough-love': 'direct and results-focused',
      'calm': 'patient and supportive',
      'encouraging': 'positive and motivational',
      'structured': 'systematic and data-driven',
      'fun': 'energetic and engaging',
      'holistic': 'mind-body focused'
    };
    return styleMap[style] || 'personalised';
  };

  const hasSelections = selectedClientTypes.length > 0 || selectedCoachingStyles.length > 0;
  const hasContent = currentDescription.trim().length > 0;
  const isImproveMode = hasContent;
  
  const getFieldLabel = (fieldType: string): string => {
    const labels = {
      tagline: 'Tagline',
      how_started: 'Origin Story', 
      philosophy: 'Philosophy',
      bio: 'Bio'
    };
    return labels[fieldType as keyof typeof labels] || 'Description';
  };

  return (
    <Card className="border-purple-300 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI {getFieldLabel(fieldType)} Helper
            </p>
            <p className="text-xs text-muted-foreground">
              {isImproveMode 
                ? `Improve your existing ${getFieldLabel(fieldType).toLowerCase()} with AI-powered suggestions`
                : hasSelections 
                  ? `Generate personalised ${getFieldLabel(fieldType).toLowerCase()} based on your selections`
                  : `Generate ${getFieldLabel(fieldType).toLowerCase()} suggestions`
              }
            </p>
          </div>
          {!autoGenerate && (
            <Button
              variant="ai"
              size="sm"
              onClick={generateSuggestions}
              disabled={(!hasSelections && !hasContent) || isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isImproveMode ? 'Improving...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isImproveMode ? 'Improve' : 'Generate'}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Show selected context - only when relevant */}
        {hasContent && isImproveMode && suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="text-xs font-medium">Original:</p>
              <div className="bg-white/60 p-2 rounded text-xs text-muted-foreground border border-purple-100">
                {currentDescription.length > 80 
                  ? currentDescription.substring(0, 80) + "..."
                  : currentDescription
                }
              </div>
            </div>
          </div>
        )}

        {/* Generated suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium">
              {isImproveMode ? 'AI-improved suggestions:' : 'AI-generated suggestions:'}
            </p>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:bg-purple-100 transition-colors border-purple-200 bg-white/80"
              onClick={() => onSuggestionSelect(suggestion)}
            >
                  <CardContent className="p-3">
                    <p className="text-sm leading-relaxed">{suggestion}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Click any suggestion to {isImproveMode ? 'replace your current content' : 'use it'}, or use it as inspiration
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}