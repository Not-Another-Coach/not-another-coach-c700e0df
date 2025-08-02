import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple' | 'range' | 'text';
  question: string;
  description?: string;
  options?: { value: string; label: string; emoji?: string }[];
  min?: number;
  max?: number;
  unit?: string;
  conditional?: {
    dependsOn: string;
    showIf: string[];
  };
}

interface QuizAnswer {
  questionId: string;
  value: string | string[] | number;
}

interface OnboardingQuizProps {
  onComplete: (answers: QuizAnswer[]) => void;
  onSkip?: () => void;
  existingAnswers?: QuizAnswer[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'fitness_goals',
    type: 'multiple',
    question: 'What are your fitness goals?',
    description: 'Select all that apply to you',
    options: [
      { value: 'weight_loss', label: 'Weight Loss', emoji: '🔥' },
      { value: 'muscle_gain', label: 'Muscle Gain', emoji: '💪' },
      { value: 'endurance', label: 'Improve Endurance', emoji: '🏃' },
      { value: 'strength', label: 'Build Strength', emoji: '🏋️' },
      { value: 'flexibility', label: 'Increase Flexibility', emoji: '🧘' },
      { value: 'general_fitness', label: 'General Fitness', emoji: '⚡' },
      { value: 'rehabilitation', label: 'Injury Rehabilitation', emoji: '🩹' },
      { value: 'sport_performance', label: 'Sport Performance', emoji: '🏆' }
    ]
  },
  {
    id: 'experience_level',
    type: 'single',
    question: 'What\'s your fitness experience level?',
    description: 'This helps us match you with the right trainer',
    options: [
      { value: 'beginner', label: 'Beginner', emoji: '🌱' },
      { value: 'intermediate', label: 'Intermediate', emoji: '🌿' },
      { value: 'advanced', label: 'Advanced', emoji: '🌳' },
      { value: 'expert', label: 'Expert/Athlete', emoji: '🏅' }
    ]
  },
  {
    id: 'workout_frequency',
    type: 'single',
    question: 'How often do you want to work out?',
    description: 'Choose your preferred training frequency',
    options: [
      { value: '1-2', label: '1-2 times per week', emoji: '📅' },
      { value: '3-4', label: '3-4 times per week', emoji: '📋' },
      { value: '5-6', label: '5-6 times per week', emoji: '📊' },
      { value: 'daily', label: 'Daily', emoji: '🔥' }
    ]
  },
  {
    id: 'training_type',
    type: 'multiple',
    question: 'What training types interest you?',
    description: 'Select your preferred workout styles',
    options: [
      { value: 'strength_training', label: 'Strength Training', emoji: '🏋️' },
      { value: 'cardio', label: 'Cardio', emoji: '❤️' },
      { value: 'hiit', label: 'HIIT', emoji: '⚡' },
      { value: 'yoga', label: 'Yoga', emoji: '🧘' },
      { value: 'pilates', label: 'Pilates', emoji: '🤸' },
      { value: 'crossfit', label: 'CrossFit', emoji: '🔥' },
      { value: 'martial_arts', label: 'Martial Arts', emoji: '🥋' },
      { value: 'dance', label: 'Dance Fitness', emoji: '💃' }
    ]
  },
  {
    id: 'session_preference',
    type: 'single',
    question: 'How do you prefer to train?',
    description: 'Choose your training format preference',
    options: [
      { value: 'in_person', label: 'In-Person Only', emoji: '🏋️' },
      { value: 'online', label: 'Online Only', emoji: '💻' },
      { value: 'hybrid', label: 'Both In-Person & Online', emoji: '🔄' },
      { value: 'group', label: 'Group Sessions', emoji: '👥' }
    ]
  },
  {
    id: 'budget_range',
    type: 'single',
    question: 'What\'s your budget per session?',
    description: 'This helps us show trainers in your price range',
    options: [
      { value: '30-50', label: '$30-50 per session', emoji: '💵' },
      { value: '50-75', label: '$50-75 per session', emoji: '💶' },
      { value: '75-100', label: '$75-100 per session', emoji: '💷' },
      { value: '100+', label: '$100+ per session', emoji: '💎' }
    ]
  },
  {
    id: 'postcode',
    type: 'text',
    question: 'What\'s your postcode?',
    description: 'This helps us find trainers in your area for in-person sessions',
    conditional: {
      dependsOn: 'session_preference',
      showIf: ['in_person', 'hybrid']
    }
  }
];

export function OnboardingQuiz({ onComplete, onSkip, existingAnswers = [] }: OnboardingQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>(existingAnswers);

  // Define getCurrentAnswer FIRST, before any functions that use it
  const getCurrentAnswer = (questionId: string) => {
    return answers.find(a => a.questionId === questionId);
  };

  // Filter questions based on conditional logic - now using useMemo for proper dependencies
  const visibleQuestions = useMemo(() => {
    return quizQuestions.filter(question => {
      if (!question.conditional) return true;
      
      const dependentAnswer = getCurrentAnswer(question.conditional.dependsOn);
      if (!dependentAnswer) return false;
      
      return question.conditional.showIf.includes(dependentAnswer.value as string);
    });
  }, [answers]); // Re-calculate when answers change

  const updateAnswer = (questionId: string, value: string | string[] | number) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      const newAnswer = { questionId, value };
      
      if (existing >= 0) {
        return prev.map((a, i) => i === existing ? newAnswer : a);
      } else {
        return [...prev, newAnswer];
      }
    });
  };

  const handleSingleSelect = (questionId: string, value: string) => {
    updateAnswer(questionId, value);
  };

  const handleMultiSelect = (questionId: string, value: string) => {
    const currentAnswer = getCurrentAnswer(questionId);
    const currentValues = (currentAnswer?.value as string[]) || [];
    
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateAnswer(questionId, newValues);
  };

  const isAnswered = (questionId: string) => {
    const answer = getCurrentAnswer(questionId);
    if (!answer) return false;
    
    if (Array.isArray(answer.value)) {
      return answer.value.length > 0;
    }
    
    return answer.value !== undefined && answer.value !== '';
  };

  const canGoNext = () => {
    return isAnswered(visibleQuestions[currentQuestion].id);
  };

  const goNext = () => {
    if (currentQuestion < visibleQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const goPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const question = visibleQuestions[currentQuestion];
  const currentAnswer = getCurrentAnswer(question.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestion + 1} of {visibleQuestions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / visibleQuestions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentQuestion + 1) / visibleQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{question.question}</CardTitle>
            {question.description && (
              <CardDescription className="text-base">{question.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {question.type === 'single' && (
              <div className="grid gap-3">
                {question.options?.map((option) => (
                  <Button
                    key={option.value}
                    variant={currentAnswer?.value === option.value ? "default" : "outline"}
                    className={cn(
                      "justify-start h-auto p-4 text-left transition-all",
                      currentAnswer?.value === option.value && "ring-2 ring-primary"
                    )}
                    onClick={() => handleSingleSelect(question.id, option.value)}
                  >
                    <span className="text-2xl mr-3">{option.emoji}</span>
                    <span className="text-base">{option.label}</span>
                    {currentAnswer?.value === option.value && (
                      <CheckCircle className="ml-auto h-5 w-5" />
                    )}
                  </Button>
                ))}
              </div>
            )}

            {question.type === 'multiple' && (
              <div className="grid gap-3">
                {question.options?.map((option) => {
                  const isSelected = (currentAnswer?.value as string[])?.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "justify-start h-auto p-4 text-left transition-all",
                        isSelected && "ring-2 ring-primary"
                      )}
                      onClick={() => handleMultiSelect(question.id, option.value)}
                    >
                      <span className="text-2xl mr-3">{option.emoji}</span>
                      <span className="text-base">{option.label}</span>
                      {isSelected && (
                        <CheckCircle className="ml-auto h-5 w-5" />
                      )}
                    </Button>
                  );
                })}
              </div>
            )}

            {question.type === 'text' && (
              <div className="space-y-4">
                <Input
                  placeholder="Enter your postcode..."
                  value={(currentAnswer?.value as string) || ''}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            )}

            {/* Selected items preview for multiple choice */}
            {question.type === 'multiple' && currentAnswer && (currentAnswer.value as string[]).length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {(currentAnswer.value as string[]).map((value) => {
                    const option = question.options?.find(opt => opt.value === value);
                    return (
                      <Badge key={value} variant="secondary">
                        {option?.emoji} {option?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goPrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {onSkip && currentQuestion === 0 && (
              <Button variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
            )}
            
            <Button
              onClick={goNext}
              disabled={!canGoNext()}
              className="flex items-center gap-2"
            >
              {currentQuestion === visibleQuestions.length - 1 ? 'Complete Quiz' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}