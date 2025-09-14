import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LocationAutocompleteField } from "@/components/ui/LocationAutocompleteField";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { QuizResults } from "./QuizResults";
import { QuizOptionCard } from "./QuizOptionCard";
import { 
  ChevronRight, ChevronLeft, Target, DollarSign, Users, MapPin, Calendar,
  Scale, Dumbbell, Heart, Trophy, Activity, Cross, X, Sparkles
} from "lucide-react";

interface QuizStep {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  question: string;
  type: 'single' | 'multiple' | 'location_input';
  options: { value: string; label: string; description?: string; icon?: React.ComponentType<any> }[];
}

const quizSteps: QuizStep[] = [
  {
    id: 'goals',
    title: 'Your Goals',
    icon: Target,
    question: 'What are your main fitness goals?',
    type: 'multiple',
    options: [
      { value: 'weight_loss', label: 'Weight Loss', description: 'Shed pounds and improve body composition', icon: Scale },
      { value: 'muscle_building', label: 'Build Muscle', description: 'Increase strength and lean muscle mass', icon: Dumbbell },
      { value: 'general_fitness', label: 'General Fitness', description: 'Improve overall health and energy', icon: Heart },
      { value: 'sports_performance', label: 'Sports Performance', description: 'Enhance athletic ability', icon: Trophy },
      { value: 'flexibility', label: 'Flexibility & Mobility', description: 'Improve range of motion and prevent injury', icon: Activity },
      { value: 'rehabilitation', label: 'Injury Recovery', description: 'Recover from or prevent injuries', icon: Cross },
    ]
  },
  {
    id: 'budget',
    title: 'Budget',
    icon: DollarSign,
    question: 'What\'s your monthly budget for personal training?',
    type: 'single',
    options: [
      { value: '0-200', label: '£0-200/month', description: 'Budget-friendly options' },
      { value: '200-400', label: '£200-400/month', description: 'Mid-range investment' },
      { value: '400-600', label: '£400-600/month', description: 'Premium training' },
      { value: '600+', label: '£600+/month', description: 'Luxury coaching' },
    ]
  },
  {
    id: 'coachingStyle',
    title: 'Coaching Style',
    icon: Users,
    question: 'What coaching style works best for you?',
    type: 'multiple',
    options: [
      { value: 'motivational', label: 'Motivational', description: 'High energy and encouraging' },
      { value: 'analytical', label: 'Data-Driven', description: 'Focuses on metrics and progress tracking' },
      { value: 'gentle', label: 'Gentle & Patient', description: 'Supportive and understanding approach' },
      { value: 'challenging', label: 'Challenging', description: 'Pushes you to exceed your limits' },
      { value: 'educational', label: 'Educational', description: 'Teaches you the why behind exercises' },
    ]
  },
  {
    id: 'availability',
    title: 'Availability',
    icon: Calendar,
    question: 'When do you prefer to train?',
    type: 'single',
    options: [
      { value: 'morning', label: 'Morning (6-10 AM)', description: 'Early bird sessions' },
      { value: 'afternoon', label: 'Afternoon (12-5 PM)', description: 'Midday workouts' },
      { value: 'evening', label: 'Evening (6-9 PM)', description: 'After work sessions' },
      { value: 'flexible', label: 'Flexible', description: 'Can adapt to trainer\'s schedule' },
    ]
  },
  {
    id: 'location',
    title: 'Location',
    icon: MapPin,
    question: 'Where would you like to train?',
    type: 'location_input',
    options: []
  }
];

interface MatchQuizModalProps {
  isOpen: boolean;
  onComplete: (results: any) => void;
  onClose: () => void;
}

export const MatchQuizModal = ({ isOpen, onComplete, onClose }: MatchQuizModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [isOnlineSelected, setIsOnlineSelected] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const { saveQuizResults } = useAnonymousSession();

  const currentQuizStep = quizSteps[currentStep];
  const isLastStep = currentStep === quizSteps.length - 1;
  const canProceed = answers[currentQuizStep.id] && 
    (Array.isArray(answers[currentQuizStep.id]) ? 
      (answers[currentQuizStep.id] as string[]).length > 0 : 
      answers[currentQuizStep.id]);

  // Auto-advance for single-choice questions
  useEffect(() => {
    if (currentQuizStep.type === 'single' && canProceed && currentStep < quizSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800); // Short delay for better UX
      
      return () => clearTimeout(timer);
    }
  }, [answers[currentQuizStep?.id], currentQuizStep?.type, canProceed, currentStep]);

  const handleAnswer = (stepId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [stepId]: value
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      // Complete quiz and show summary first
      const quizResults = {
        goals: answers.goals as string[],
        budget: answers.budget as string,
        coachingStyle: answers.coachingStyle as string[],
        availability: answers.availability as string,
        location: answers.location as string,
      };
      
      saveQuizResults(quizResults);
      setShowSummary(true);
      // After showing summary, proceed to results
      setTimeout(() => {
        setShowSummary(false);
        setShowResults(true);
        onComplete(quizResults);
      }, 2000);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
    setShowSummary(false);
    setIsOnlineSelected(false);
    onClose();
  };

  const Icon = currentQuizStep?.icon;

  // Summary screen
  if (showSummary) {
    const goalLabels = (answers.goals as string[] || []).map(goal => 
      quizSteps[0].options.find(opt => opt.value === goal)?.label
    ).filter(Boolean).join(', ');
    
    const budgetLabel = quizSteps[1].options.find(opt => opt.value === answers.budget)?.label;
    const availabilityLabel = quizSteps[3].options.find(opt => opt.value === answers.availability)?.label;
    const location = answers.location === 'online' ? 'Online Training' : answers.location;

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg border-0 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-xl">
          <DialogTitle className="sr-only">Quiz Summary</DialogTitle>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Perfect! Finding your matches...</h2>
            
            <div className="space-y-3 text-left bg-background/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">Here's what we found for you:</p>
              <div className="space-y-2">
                <div><span className="font-medium">Goals:</span> {goalLabels}</div>
                <div><span className="font-medium">Budget:</span> {budgetLabel}</div>
                <div><span className="font-medium">Available:</span> {availabilityLabel}</div>
                <div><span className="font-medium">Location:</span> {location}</div>
              </div>
            </div>
            
            <div className="animate-pulse">
              <div className="h-2 bg-primary rounded-full animate-pulse"></div>
              <p className="text-sm text-muted-foreground mt-2">Matching you with perfect coaches...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showResults) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto border-0">
          <DialogTitle className="sr-only">Quiz Results</DialogTitle>
          <QuizResults onBack={() => setShowResults(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 bg-background/95 backdrop-blur-xl">
        <DialogTitle className="sr-only">Find Your Perfect Coach</DialogTitle>
        
        {/* Custom close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="pt-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentQuizStep.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {currentQuizStep.title} ({currentStep + 1}/{quizSteps.length})
                </p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex gap-2">
              {quizSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-10 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-8">{currentQuizStep.question}</h3>

          {/* Content */}
          <div className="space-y-6">
            {currentQuizStep.type === 'location_input' ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 p-4 rounded-lg border bg-accent/20">
                  <Checkbox
                    id="online-training"
                    checked={isOnlineSelected}
                    onCheckedChange={(checked) => {
                      setIsOnlineSelected(checked as boolean);
                      if (checked) {
                        handleAnswer(currentQuizStep.id, 'online');
                      } else {
                        handleAnswer(currentQuizStep.id, '');
                      }
                    }}
                  />
                  <Label htmlFor="online-training" className="text-base font-medium">
                    I prefer online training only
                  </Label>
                </div>
                
                {!isOnlineSelected && (
                  <div>
                    <Label htmlFor="location-input" className="text-base font-medium mb-3 block">
                      Enter your city or location
                    </Label>
                    <LocationAutocompleteField
                      value={answers[currentQuizStep.id] as string || ''}
                      onChange={(value) => handleAnswer(currentQuizStep.id, value)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuizStep.options.map((option) => {
                  const isSelected = currentQuizStep.type === 'single' 
                    ? answers[currentQuizStep.id] === option.value
                    : (answers[currentQuizStep.id] as string[] || []).includes(option.value);
                  
                  return (
                    <QuizOptionCard
                      key={option.value}
                      option={option}
                      isSelected={isSelected}
                      type={currentQuizStep.type}
                      onSelect={() => {
                        if (currentQuizStep.type === 'single') {
                          handleAnswer(currentQuizStep.id, option.value);
                        } else {
                          const currentAnswers = (answers[currentQuizStep.id] as string[]) || [];
                          let newAnswers;
                          
                          if (isSelected) {
                            newAnswers = currentAnswers.filter(a => a !== option.value);
                          } else {
                            newAnswers = [...currentAnswers, option.value];
                          }
                          
                          handleAnswer(currentQuizStep.id, newAnswers);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-8">
              <Button
                variant="ghost"
                onClick={currentStep === 0 ? handleClose : handleBack}
                className="text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {currentStep === 0 ? 'Skip Quiz' : 'Back'}
              </Button>
              
              {/* Only show Next button for multi-choice and location steps */}
              {(currentQuizStep.type === 'multiple' || currentQuizStep.type === 'location_input') && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="px-6"
                >
                  {isLastStep ? 'See My Matches' : 'Next'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};