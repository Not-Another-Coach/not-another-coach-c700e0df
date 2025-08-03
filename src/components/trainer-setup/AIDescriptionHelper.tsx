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
}

export function AIDescriptionHelper({ 
  selectedClientTypes, 
  selectedCoachingStyles, 
  currentDescription,
  onSuggestionSelect 
}: AIDescriptionHelperProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = () => {
    setIsGenerating(true);
    
    // Simulate AI generation based on selections
    setTimeout(() => {
      const baseSuggestions = generatePersonalizedSuggestions(selectedClientTypes, selectedCoachingStyles);
      setSuggestions(baseSuggestions);
      setIsGenerating(false);
    }, 1500);
  };

  const generatePersonalizedSuggestions = (clientTypes: string[], coachingStyles: string[]): string[] => {
    const suggestions = [];
    
    // Base templates
    const templates = [
      "I specialize in helping {CLIENT_TYPE} achieve their fitness goals through {COACHING_STYLE} approach.",
      "As a trainer focused on {CLIENT_TYPE}, I bring a {COACHING_STYLE} methodology to every session.",
      "I'm passionate about working with {CLIENT_TYPE} using {COACHING_STYLE} techniques that deliver real results.",
      "My expertise lies in supporting {CLIENT_TYPE} through {COACHING_STYLE} training methods."
    ];

    // Generate suggestions based on selections
    if (clientTypes.length > 0 && coachingStyles.length > 0) {
      const primaryClient = clientTypes[0].toLowerCase();
      const primaryStyle = getStyleDescription(coachingStyles[0]);
      
      templates.forEach(template => {
        const suggestion = template
          .replace('{CLIENT_TYPE}', primaryClient)
          .replace('{COACHING_STYLE}', primaryStyle);
        suggestions.push(suggestion);
      });
    } else {
      // Fallback suggestions
      suggestions.push(
        "I'm a dedicated personal trainer committed to helping clients achieve sustainable fitness results through personalized training programs.",
        "With years of experience in fitness coaching, I focus on creating positive, supportive environments where clients can thrive.",
        "I believe in making fitness accessible and enjoyable for everyone, regardless of their starting point or goals.",
        "My approach combines evidence-based training methods with genuine care for each client's individual journey."
      );
    }

    return suggestions.slice(0, 4);
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

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Description Helper
            </p>
            <p className="text-xs text-muted-foreground">
              {hasSelections 
                ? "Generate personalized descriptions based on your selections"
                : "Select client types and coaching styles first for personalized suggestions"
              }
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={!hasSelections || isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>

        {/* Show selected context */}
        {hasSelections && (
          <div className="space-y-2">
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

        {/* Generated suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium">AI-generated suggestions:</p>
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
              💡 Click any suggestion to use it, or use it as inspiration for your own description
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}