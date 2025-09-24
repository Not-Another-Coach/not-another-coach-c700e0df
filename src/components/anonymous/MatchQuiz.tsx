import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { LocationAutocompleteField } from "@/components/ui/LocationAutocompleteField";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { QuizResults } from "./QuizResults";
import { ChevronRight, Target, DollarSign, Users, MapPin, Calendar } from "lucide-react";

interface QuizStep {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  question: string;
  type: 'single' | 'multiple' | 'location_input';
  options: { value: string; label: string; description?: string }[];
}

const quizSteps: QuizStep[] = [
  {
    id: 'goals',
    title: 'Fitness Goals',
    icon: Target,
    question: 'What are your main fitness goals?',
    type: 'multiple',
    options: [
      { value: 'weight_loss', label: 'Weight Loss', description: 'Shed pounds and improve body composition' },
      { value: 'muscle_building', label: 'Build Muscle', description: 'Increase strength and lean muscle mass' },
      { value: 'general_fitness', label: 'General Fitness', description: 'Improve overall health and energy' },
      { value: 'sports_performance', label: 'Sports Performance', description: 'Enhance athletic ability' },
      { value: 'flexibility', label: 'Flexibility & Mobility', description: 'Improve range of motion and prevent injury' },
      { value: 'rehabilitation', label: 'Injury Recovery', description: 'Recover from or prevent injuries' },
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
      { value: 'nurturing', label: 'Nurturing & Supportive', description: 'Gentle encouragement, patience, and emotional support' },
      { value: 'tough_love', label: 'Tough Love', description: 'Direct feedback, high standards, and accountability' },
      { value: 'high_energy', label: 'High Energy', description: 'Enthusiastic, motivating, and energetic approach' },
      { value: 'analytical', label: 'Technical & Analytical', description: 'Data-driven, precise form correction, and detailed explanations' },
      { value: 'social', label: 'Social & Fun', description: 'Interactive, social, and makes fitness enjoyable' },
      { value: 'calm', label: 'Calm & Mindful', description: 'Peaceful approach focusing on mind-body connection' },
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

interface MatchQuizProps {
  onComplete: (results: any) => void;
  onClose: () => void;
}

export const MatchQuiz = ({ onComplete, onClose }: MatchQuizProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [isOnlineSelected, setIsOnlineSelected] = useState(false);
  const { saveQuizResults } = useAnonymousSession();

  const currentQuizStep = quizSteps[currentStep];
  const isLastStep = currentStep === quizSteps.length - 1;
  const canProceed = answers[currentQuizStep.id] && 
    (Array.isArray(answers[currentQuizStep.id]) ? 
      (answers[currentQuizStep.id] as string[]).length > 0 : 
      answers[currentQuizStep.id]);

  const handleAnswer = (stepId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [stepId]: value
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      // Complete quiz
      const quizResults = {
        goals: answers.goals as string[],
        budget: answers.budget as string,
        coachingStyle: answers.coachingStyle as string[],
        availability: answers.availability as string,
        location: answers.location as string,
      };
      
      saveQuizResults(quizResults);
      setShowResults(true);
      onComplete(quizResults);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const Icon = currentQuizStep.icon;

  if (showResults) {
    return (
      <QuizResults onBack={() => setShowResults(false)} />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentQuizStep.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {quizSteps.length}
                </p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex gap-1">
              {quizSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <h3 className="text-xl font-semibold">{currentQuizStep.question}</h3>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentQuizStep.type === 'location_input' ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
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
                <Label htmlFor="online-training" className="text-sm font-medium">
                  I prefer online training only
                </Label>
              </div>
              
              {!isOnlineSelected && (
                <div>
                  <Label htmlFor="location-input" className="text-sm font-medium">
                    Enter your city or location
                  </Label>
                  <LocationAutocompleteField
                    value={answers[currentQuizStep.id] as string || ''}
                    onChange={(value) => handleAnswer(currentQuizStep.id, value)}
                  />
                </div>
              )}
            </div>
          ) : currentQuizStep.type === 'single' ? (
            <RadioGroup
              value={answers[currentQuizStep.id] as string || ''}
              onValueChange={(value) => handleAnswer(currentQuizStep.id, value)}
            >
              {currentQuizStep.options.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              {currentQuizStep.options.map((option) => {
                const isChecked = (answers[currentQuizStep.id] as string[] || []).includes(option.value);
                
                return (
                  <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50">
                    <Checkbox
                      id={option.value}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentAnswers = (answers[currentQuizStep.id] as string[]) || [];
                        let newAnswers;
                        
                        if (checked) {
                          newAnswers = [...currentAnswers, option.value];
                        } else {
                          newAnswers = currentAnswers.filter(a => a !== option.value);
                        }
                        
                        handleAnswer(currentQuizStep.id, newAnswers);
                      }}
                      className="mt-1"
                    />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </div>
                      )}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onClose : handleBack}
            >
              {currentStep === 0 ? 'Skip Quiz' : 'Back'}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed}
            >
              {isLastStep ? 'See My Matches' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};