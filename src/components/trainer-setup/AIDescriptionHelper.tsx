import { useState } from "react";
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
}

export function AIDescriptionHelper({ 
  selectedClientTypes, 
  selectedCoachingStyles, 
  currentDescription,
  onSuggestionSelect,
  fieldType = 'bio'
}: AIDescriptionHelperProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = () => {
    setIsGenerating(true);
    
    // Simulate AI generation based on selections and field type
    setTimeout(() => {
      const baseSuggestions = currentDescription.trim()
        ? generateImprovedSuggestions(currentDescription, fieldType, selectedClientTypes, selectedCoachingStyles)
        : generatePersonalizedSuggestions(selectedClientTypes, selectedCoachingStyles, fieldType);
      setSuggestions(baseSuggestions);
      setIsGenerating(false);
    }, 1500);
  };

  const generatePersonalizedSuggestions = (clientTypes: string[], coachingStyles: string[], fieldType: string): string[] => {
    const suggestions = [];
    
    const fieldTemplates = getFieldTemplates(fieldType);
    const primaryClient = clientTypes[0]?.toLowerCase() || 'clients';
    const primaryStyle = getStyleDescription(coachingStyles[0] || '');
    
    // Generate suggestions based on selections and field type
    if (clientTypes.length > 0 || coachingStyles.length > 0) {
      fieldTemplates.personalized.forEach(template => {
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
    // Analyze the text and generate improvements
    const improvements = [];
    const originalLength = text.length;
    
    // Grammar and clarity improvements
    improvements.push(enhanceTextClarity(text));
    
    // Professional tone enhancement
    improvements.push(enhanceTextProfessionalism(text));
    
    // Impact and engagement improvement
    improvements.push(enhanceTextImpact(text, fieldType));
    
    // Personalization based on selections
    if (clientTypes.length > 0 || coachingStyles.length > 0) {
      improvements.push(personalizeText(text, clientTypes, coachingStyles, fieldType));
    }
    
    // Remove duplicates and original text
    return improvements.filter((suggestion, index, arr) => 
      suggestion !== text && arr.indexOf(suggestion) === index
    ).slice(0, 4);
  };

  const getFieldTemplates = (fieldType: string) => {
    const templates = {
      tagline: {
        personalized: [
          "Empowering {CLIENT_TYPE} through {COACHING_STYLE} fitness coaching",
          "Transforming {CLIENT_TYPE} with {COACHING_STYLE} training methods",
          "Your {COACHING_STYLE} trainer for {CLIENT_TYPE} success",
          "Helping {CLIENT_TYPE} thrive with {COACHING_STYLE} approach"
        ],
        fallback: [
          "Transforming lives through personalized fitness coaching",
          "Your partner in fitness, strength, and confidence",
          "Making fitness achievable, sustainable, and enjoyable",
          "Empowering you to become your strongest self"
        ]
      },
      how_started: {
        personalized: [
          "My journey began when I realized how much {CLIENT_TYPE} needed {COACHING_STYLE} support in their fitness journey.",
          "After years of working with {CLIENT_TYPE}, I discovered the power of {COACHING_STYLE} coaching to create lasting change.",
          "It started with my passion for helping {CLIENT_TYPE} overcome their fitness challenges through {COACHING_STYLE} methods.",
          "My story began when I saw firsthand how {COACHING_STYLE} training could transform the lives of {CLIENT_TYPE}."
        ],
        fallback: [
          "My fitness journey started with my own transformation - from struggling with consistency to finding my passion for helping others.",
          "It began when I realized that fitness isn't just about physical strength, but about building confidence and resilience.",
          "My path to becoming a trainer started when I discovered how much I loved helping people overcome their fitness challenges.",
          "After my own fitness transformation, I knew I wanted to help others experience that same life-changing journey."
        ]
      },
      philosophy: {
        personalized: [
          "I believe every {CLIENT_TYPE} deserves {COACHING_STYLE} guidance that meets them where they are and helps them grow.",
          "My philosophy centers on providing {CLIENT_TYPE} with {COACHING_STYLE} support that creates sustainable, lasting change.",
          "I'm committed to helping {CLIENT_TYPE} through {COACHING_STYLE} methods that honor their unique needs and goals.",
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
        personalized: [
          "I specialize in helping {CLIENT_TYPE} achieve their fitness goals through {COACHING_STYLE} approach.",
          "As a trainer focused on {CLIENT_TYPE}, I bring a {COACHING_STYLE} methodology to every session.",
          "I'm passionate about working with {CLIENT_TYPE} using {COACHING_STYLE} techniques that deliver real results.",
          "My expertise lies in supporting {CLIENT_TYPE} through {COACHING_STYLE} training methods."
        ],
        fallback: [
          "I'm a dedicated personal trainer committed to helping clients achieve sustainable fitness results through personalized training programs.",
          "With years of experience in fitness coaching, I focus on creating positive, supportive environments where clients can thrive.",
          "I believe in making fitness accessible and enjoyable for everyone, regardless of their starting point or goals.",
          "My approach combines evidence-based training methods with genuine care for each client's individual journey."
        ]
      }
    };
    
    return templates[fieldType as keyof typeof templates] || templates.bio;
  };

  const enhanceTextClarity = (text: string): string => {
    // Simple text clarity improvements
    return text
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => punct + ' ' + letter.toUpperCase())
      .trim();
  };

  const enhanceTextProfessionalism = (text: string): string => {
    // Add more professional tone while keeping the essence
    if (text.length < 50) return text + " I'm dedicated to helping you achieve lasting results.";
    return text.replace(/\bi\s/gi, 'I ').replace(/\bim\b/gi, "I'm");
  };

  const enhanceTextImpact = (text: string, fieldType: string): string => {
    // Add impact based on field type
    const impactPhrases = {
      tagline: ["proven results", "transformative approach", "personalized success"],
      how_started: ["life-changing moment", "transformative experience", "defining journey"],
      philosophy: ["core belief", "fundamental principle", "guiding philosophy"],
      bio: ["proven track record", "comprehensive approach", "dedicated expertise"]
    };
    
    const phrases = impactPhrases[fieldType as keyof typeof impactPhrases] || impactPhrases.bio;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    if (text.length > 100) return text;
    return text + ` My ${randomPhrase} ensures every client gets the support they need.`;
  };

  const personalizeText = (text: string, clientTypes: string[], coachingStyles: string[], fieldType: string): string => {
    const primaryClient = clientTypes[0]?.toLowerCase() || 'clients';
    const primaryStyle = getStyleDescription(coachingStyles[0] || '');
    
    // Add personalization based on selections
    return `${text} I specialize in working with ${primaryClient} using my ${primaryStyle} coaching approach.`;
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
    return styleMap[style] || 'personalized';
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
    <Card className="border-primary/20 bg-primary/5">
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
                  ? `Generate personalized ${getFieldLabel(fieldType).toLowerCase()} based on your selections`
                  : `Generate ${getFieldLabel(fieldType).toLowerCase()} suggestions`
              }
            </p>
          </div>
          <Button
            variant="outline"
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
        </div>

        {/* Show selected context */}
        {(hasSelections || hasContent) && (
          <div className="space-y-2">
            {hasContent && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Current content:</p>
                <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground">
                  {currentDescription.length > 100 
                    ? currentDescription.substring(0, 100) + "..."
                    : currentDescription
                  }
                </div>
              </div>
            )}
            {hasSelections && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Based on your selections:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedClientTypes.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                  {selectedCoachingStyles.map(style => {
                    const styleLabels: Record<string, string> = {
                      'tough-love': 'Tough Love',
                      'calm': 'Calm & Patient',
                      'encouraging': 'Encouraging',
                      'structured': 'Structured',
                      'fun': 'Fun & Energetic',
                      'holistic': 'Holistic'
                    };
                    return (
                      <Badge key={style} variant="outline" className="text-xs">
                        {styleLabels[style] || style}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
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
                  className="cursor-pointer hover:bg-primary/10 transition-colors border-primary/10"
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