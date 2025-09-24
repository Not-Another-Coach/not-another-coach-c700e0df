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
  ChevronRight, ChevronLeft, Target, DollarSign, Users, MapPin, Calendar, Clock,
  Scale, Dumbbell, Heart, Trophy, Activity, Cross, X, Sparkles
} from "lucide-react";

interface QuizStep {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  question: string;
  type: 'single' | 'multiple';
  options: { value: string | number; label: string; description?: string; icon?: React.ComponentType<any> }[];
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
      { value: 'budget_0_50', label: 'Under £50/month', description: 'Budget-friendly options' },
      { value: 'budget_50_100', label: '£50-100/month', description: 'Most popular range' },
      { value: 'budget_100_200', label: '£100-200/month', description: 'Premium options' },
      { value: 'budget_200_500', label: '£200-500/month', description: 'High-end coaching' },
      { value: 'budget_500_plus', label: '£500+/month', description: 'Luxury tier' },
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
    id: 'trainingFrequency',
    title: 'Training Frequency',
    icon: Calendar,
    question: 'How often would you like to train?',
    type: 'single',
    options: [
      { value: 1, label: '1 day per week', description: 'Light commitment' },
      { value: 2, label: '2 days per week', description: 'Good for beginners' },
      { value: 3, label: '3 days per week', description: 'Most popular choice' },
      { value: 4, label: '4 days per week', description: 'Serious commitment' },
      { value: 5, label: '5+ days per week', description: 'High intensity' },
    ]
  },
  {
    id: 'timeSlots',
    title: 'Available Times',
    icon: Clock,
    question: 'When are you usually available? (Select all that apply)',
    type: 'multiple',
    options: [
      { value: 'early_morning', label: 'Early Morning', description: '6:00 - 9:00 AM' },
      { value: 'morning', label: 'Morning', description: '9:00 AM - 12:00 PM' },
      { value: 'lunch', label: 'Lunch Time', description: '12:00 - 2:00 PM' },
      { value: 'afternoon', label: 'Afternoon', description: '2:00 - 6:00 PM' },
      { value: 'evening', label: 'Evening', description: '6:00 - 9:00 PM' },
      { value: 'weekend', label: 'Weekends', description: 'Flexible timing' },
    ]
  },
  {
    id: 'startTimeline',
    title: 'Start Timeline',
    icon: Calendar,
    question: 'When would you like to start?',
    type: 'single',
    options: [
      { value: 'urgent', label: 'ASAP', description: 'I want to start within the next week' },
      { value: 'next_month', label: 'Within a month', description: 'I\'m ready to start soon but not rushing' },
      { value: 'flexible', label: 'I\'m flexible', description: 'I\'ll wait for the right trainer match' },
    ]
  },
  {
    id: 'location',
    title: 'Training Location',
    icon: MapPin,
    question: 'Where would you like to train?',
    type: 'single',
    options: [
      { value: 'in-person', label: 'In-Person Training', description: 'Meet at gym or outdoor location' },
      { value: 'online', label: 'Online Training', description: 'Train from home via video calls' },
      { value: 'hybrid', label: 'Hybrid (Both)', description: 'Mix of in-person and online sessions' },
    ]
  }
];

interface MatchQuizModalProps {
  isOpen: boolean;
  onComplete: (results: any) => void;
  onClose: () => void;
}

export const MatchQuizModal = ({ isOpen, onComplete, onClose }: MatchQuizModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [showResults, setShowResults] = useState(false);
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
    if (currentQuizStep?.type === 'single' && canProceed) {
      const timer = setTimeout(() => {
        if (currentStep < quizSteps.length - 1) {
          // Normal advancement
          setCurrentStep(prev => prev + 1);
        } else {
          // Last step - automatically complete the quiz
          console.log('🎯 Auto-completing quiz on final step');
          handleNext();
        }
      }, 1200); // Slightly longer delay for final step
      
      return () => clearTimeout(timer);
    }
  }, [answers[currentQuizStep?.id], currentQuizStep?.type, canProceed, currentStep]);

  const handleAnswer = (stepId: string, value: string | string[] | number) => {
    setAnswers(prev => ({
      ...prev,
      [stepId]: value
    }));
  };

  const handleNext = () => {
    console.log('🎯 MODAL: HandleNext called - isLastStep:', isLastStep, 'currentStep:', currentStep);
    console.log('🎯 MODAL: Current answers state:', answers);
    
    if (isLastStep) {
      console.log('🎯 MODAL: Processing final step - transforming quiz data');
      
      // Transform budget data to match client survey format
      const budgetMapping: Record<string, { min: number; max: number | null }> = {
        'budget_0_50': { min: 0, max: 50 },
        'budget_50_100': { min: 50, max: 100 },
        'budget_100_200': { min: 100, max: 200 },
        'budget_200_500': { min: 200, max: 500 },
        'budget_500_plus': { min: 500, max: null },
      };

      const budgetRange = budgetMapping[answers.budget as string];
      console.log('🎯 MODAL: Budget mapping result:', { 
        originalBudget: answers.budget, 
        mappedRange: budgetRange 
      });
      
      // Complete quiz and show summary first - maintain old format for compatibility
      const quizResults = {
        goals: answers.goals as string[],
        budget: answers.budget as string,
        coachingStyle: answers.coachingStyle as string[],
        availability: `${answers.trainingFrequency} days/week`,
        location: answers.location as string,
        // Extended data that matches client survey format
        primary_goals: answers.goals ? [(answers.goals as string[])[0]] : [],
        secondary_goals: answers.goals ? (answers.goals as string[]).slice(1) : [],
        budget_range_min: budgetRange?.min || null,
        budget_range_max: budgetRange?.max || null,
        budget_flexibility: 'flexible',
        preferred_coaching_style: answers.coachingStyle as string[] || [],
        preferred_training_frequency: answers.trainingFrequency as number,
        preferred_time_slots: answers.timeSlots as string[] || [],
        start_timeline: answers.startTimeline as string,
        training_location_preference: answers.location as string,
        open_to_virtual_coaching: false,
      };
      
      console.log('🎯 MODAL: Final quiz results object:', quizResults);
      console.log('🎯 MODAL: Quiz results structure validation:', {
        hasGoals: !!quizResults.goals,
        goalCount: quizResults.goals?.length,
        hasBudget: !!quizResults.budget,
        hasCoachingStyle: !!quizResults.coachingStyle,
        coachingStyleCount: quizResults.coachingStyle?.length,
        hasFrequency: !!quizResults.preferred_training_frequency,
        hasTimeSlots: !!quizResults.preferred_time_slots,
        timeSlotsCount: quizResults.preferred_time_slots?.length
      });
      
      console.log('🎯 MODAL: Calling saveQuizResults...');
      saveQuizResults(quizResults);
      console.log('🎯 MODAL: saveQuizResults call completed, showing summary');
      setShowSummary(true);
      
      // After showing summary, proceed to results with longer matching experience
      setTimeout(() => {
        console.log('🎯 MODAL: Summary timeout completed, showing results and calling onComplete');
        setShowSummary(false);
        setShowResults(true);
        onComplete(quizResults);
      }, 4500); // Increased from 2000ms to 4500ms for better UX
    } else {
      console.log('🎯 MODAL: Not final step, advancing to next step');
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
    onClose();
  };

  const Icon = currentQuizStep?.icon;

  // Summary screen
  if (showSummary) {
    const goalLabels = (answers.goals as string[] || []).map(goal => 
      quizSteps[0].options.find(opt => opt.value === goal)?.label
    ).filter(Boolean).join(', ');
    
    const budgetLabel = quizSteps[1].options.find(opt => opt.value === answers.budget)?.label;
    const frequencyLabel = quizSteps[3].options.find(opt => opt.value === answers.trainingFrequency)?.label;
    const timeSlotsLabels = (answers.timeSlots as string[] || []).map(slot => 
      quizSteps[4].options.find(opt => opt.value === slot)?.label
    ).filter(Boolean).join(', ');
    const locationLabel = quizSteps[6].options.find(opt => opt.value === answers.location)?.label;

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg border-0 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-xl">
          <DialogTitle className="sr-only">Quiz Summary</DialogTitle>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold mb-6">Perfect! Finding your matches...</h2>
            
            <div className="space-y-4 text-left bg-background/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">Here's what we found for you:</p>
              <div className="space-y-2">
                <div className="animate-fade-in" style={{animationDelay: '0.2s'}}><span className="font-medium">Goals:</span> {goalLabels}</div>
                <div className="animate-fade-in" style={{animationDelay: '0.4s'}}><span className="font-medium">Budget:</span> {budgetLabel}</div>
                <div className="animate-fade-in" style={{animationDelay: '0.6s'}}><span className="font-medium">Frequency:</span> {frequencyLabel}</div>
                <div className="animate-fade-in" style={{animationDelay: '0.8s'}}><span className="font-medium">Available:</span> {timeSlotsLabels}</div>
                <div className="animate-fade-in" style={{animationDelay: '1.0s'}}><span className="font-medium">Location:</span> {locationLabel}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground animate-fade-in" style={{animationDelay: '1.5s'}}>
                <span>🔍 Analyzing your preferences...</span>
                <span>✓</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground animate-fade-in" style={{animationDelay: '2.0s'}}>
                <span>💪 Finding compatible trainers...</span>
                <span>✓</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground animate-fade-in" style={{animationDelay: '2.5s'}}>
                <span>🎯 Matching experience levels...</span>
                <span>✓</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground animate-fade-in" style={{animationDelay: '3.0s'}}>
                <span>🌟 Ranking your best matches...</span>
                <span>✓</span>
              </div>
              
              <div className="mt-6 animate-fade-in" style={{animationDelay: '3.5s'}}>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">Almost there! Preparing your personalized results...</p>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuizStep.options.map((option) => {
                const isSelected = currentQuizStep.type === 'single' 
                  ? answers[currentQuizStep.id] === option.value
                  : (answers[currentQuizStep.id] as (string | number)[] || []).includes(option.value);
                
                return (
                  <QuizOptionCard
                    key={String(option.value)}
                    option={option}
                    isSelected={isSelected}
                    type={currentQuizStep.type}
                    onSelect={() => {
                      if (currentQuizStep.type === 'single') {
                        handleAnswer(currentQuizStep.id, option.value);
                      } else {
                        const currentAnswers = (answers[currentQuizStep.id] as (string | number)[]) || [];
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
              
              {/* Only show Next button for multi-choice steps */}
              {currentQuizStep.type === 'multiple' && (
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