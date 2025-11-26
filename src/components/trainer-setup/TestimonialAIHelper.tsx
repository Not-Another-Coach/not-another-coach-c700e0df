import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";

interface TestimonialAIHelperProps {
  clientQuote: string;
  outcomeTags: string[];
  onSuggestionSelect: (suggestion: string) => void;
  isOpen?: boolean;
  autoGenerate?: boolean;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

export function TestimonialAIHelper({ 
  clientQuote, 
  outcomeTags, 
  onSuggestionSelect,
  isOpen = true,
  autoGenerate = false,
  onGeneratingChange
}: TestimonialAIHelperProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    onGeneratingChange?.(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedSuggestions = generateAchievementSuggestions(clientQuote, outcomeTags);
    setSuggestions(generatedSuggestions);
    setIsGenerating(false);
    onGeneratingChange?.(false);
  };

  // Auto-generate when component opens if autoGenerate is true
  useEffect(() => {
    if (isOpen && autoGenerate && (clientQuote.trim() || outcomeTags.length > 0)) {
      generateSuggestions();
    }
  }, [isOpen, autoGenerate]);

  const generateAchievementSuggestions = (quote: string, tags: string[]): string[] => {
    const suggestions: string[] = [];
    
    // Tag-based suggestions
    if (tags.length > 0) {
      tags.forEach(tag => {
        switch (tag) {
          case "Lost 20kg":
            suggestions.push(
              "Lost 20kg and transformed their entire lifestyle",
              "Achieved a 20kg weight loss while building sustainable habits"
            );
            break;
          case "Lost 10kg":
            suggestions.push(
              "Lost 10kg and gained incredible confidence",
              "Achieved a 10kg weight loss in a healthy, sustainable way"
            );
            break;
          case "Lost 5kg":
            suggestions.push(
              "Lost 5kg and feels stronger than ever",
              "Achieved a 5kg weight loss while improving overall fitness"
            );
            break;
          case "Gained strength":
            suggestions.push(
              "Built incredible strength and confidence",
              "Gained functional strength that improved daily life"
            );
            break;
          case "Increased confidence":
            suggestions.push(
              "Gained unshakeable confidence and self-belief",
              "Transformed their mindset and boosted self-confidence"
            );
            break;
          case "Improved mobility":
            suggestions.push(
              "Regained mobility and freedom of movement",
              "Improved flexibility and movement quality dramatically"
            );
            break;
          case "Better sleep":
            suggestions.push(
              "Achieved better sleep quality and energy levels",
              "Transformed their sleep patterns and daily energy"
            );
            break;
          case "Reduced pain":
            suggestions.push(
              "Eliminated chronic pain through targeted training",
              "Reduced pain levels and improved quality of life"
            );
            break;
        }
      });
    }
    
    // Quote-based analysis suggestions
    if (quote.toLowerCase().includes("confident")) {
      suggestions.push("Gained life-changing confidence and self-esteem");
    }
    if (quote.toLowerCase().includes("strong")) {
      suggestions.push("Built incredible strength both physically and mentally");
    }
    if (quote.toLowerCase().includes("energy")) {
      suggestions.push("Dramatically increased energy levels and vitality");
    }
    if (quote.toLowerCase().includes("happy")) {
      suggestions.push("Achieved happiness and joy through fitness transformation");
    }
    if (quote.toLowerCase().includes("pain")) {
      suggestions.push("Overcame pain and physical limitations");
    }
    if (quote.toLowerCase().includes("fit")) {
      suggestions.push("Achieved their best fitness level ever");
    }
    
    // Generic inspiring suggestions
    if (suggestions.length < 3) {
      suggestions.push(
        "Completely transformed their relationship with fitness",
        "Achieved results they never thought possible",
        "Built a sustainable, healthy lifestyle they love",
        "Gained strength, confidence, and life-changing results"
      );
    }
    
    // Remove duplicates and return up to 4 suggestions
    return [...new Set(suggestions)].slice(0, 4);
  };

  if (!isOpen) {
    return null;
  }

  const hasContent = clientQuote.trim() || outcomeTags.length > 0;

  if (!hasContent) {
    return (
      <Card className="border-purple-300 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI Achievement Helper</span>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Add a client quote and outcome tags to generate achievement suggestions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-300 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Achievement Helper
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Get AI-powered suggestions based on the client's testimonial and outcome tags
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {!autoGenerate && (
          <Button
            onClick={generateSuggestions}
            disabled={isGenerating}
            size="sm"
            variant="ai"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating suggestions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Achievement Ideas
              </>
            )}
          </Button>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium">Click to use:</p>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:bg-purple-100 transition-colors border-purple-200 bg-white/80"
                  onClick={() => onSuggestionSelect(suggestion)}
                >
                  <CardContent className="p-3">
                    <p className="text-sm">{suggestion}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">
              💡 These are AI-generated suggestions. Feel free to modify them to match your client's specific results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
