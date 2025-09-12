import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { ChevronRight, Target, DollarSign, Users, MapPin, Calendar } from "lucide-react";

interface QuizStep {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  question: string;
  type: 'single' | 'multiple';
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
    question: 'What\'s your budget for personal training?',
    type: 'single',
    options: [
      { value: '0-50', label: '£0-50/session', description: 'Budget-friendly options' },
      { value: '50-80', label: '£50-80/session', description: 'Mid-range investment' },
      { value: '80-120', label: '£80-120/session', description: 'Premium training' },
      { value: '120+', label: '£120+/session', description: 'Luxury coaching' },
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
    type: 'single',
    options: [
      { value: 'london', label: 'London', description: 'Central London and surrounding areas' },
      { value: 'manchester', label: 'Manchester', description: 'Manchester and Greater Manchester' },
      { value: 'birmingham', label: 'Birmingham', description: 'Birmingham and West Midlands' },
      { value: 'online', label: 'Online Only', description: 'Virtual training sessions' },
      { value: 'other', label: 'Other UK Location', description: 'Specify your area' },
    ]
  }
];

interface MatchQuizProps {
  onComplete: (results: any) => void;
  onClose: () => void;
}

export const MatchQuiz = ({ onComplete, onClose }: MatchQuizProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
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
          {currentQuizStep.type === 'single' ? (
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