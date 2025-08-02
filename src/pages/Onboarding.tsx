import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { OnboardingQuiz } from '@/components/OnboardingQuiz';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QuizAnswer {
  questionId: string;
  value: string | string[] | number;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, refetchProfile } = useProfile();

  const handleQuizComplete = async (answers: QuizAnswer[]) => {
    if (!profile) return;

    try {
      // Convert answers to a more readable format for storage
      const formattedAnswers = answers.reduce((acc, answer) => {
        acc[answer.questionId] = answer.value;
        return acc;
      }, {} as Record<string, any>);

      // Extract fitness goals for the profile
      const fitnessGoals = formattedAnswers.fitness_goals || [];

      const { error } = await supabase
        .from('profiles')
        .update({
          quiz_completed: true,
          quiz_answers: formattedAnswers,
          quiz_completed_at: new Date().toISOString(),
          fitness_goals: fitnessGoals
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      await refetchProfile();
      
      toast({
        title: "Quiz completed!",
        description: "Your preferences have been saved. We'll help you find the perfect trainer.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error saving quiz answers:', error);
      toast({
        title: "Error",
        description: "Failed to save your answers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    toast({
      title: "Quiz skipped",
      description: "You can complete the quiz anytime from your profile.",
    });
    navigate('/');
  };

  // Convert existing quiz answers back to the expected format
  const existingAnswers: QuizAnswer[] = [];
  if (profile?.quiz_answers && typeof profile.quiz_answers === 'object') {
    Object.entries(profile.quiz_answers).forEach(([questionId, value]) => {
      existingAnswers.push({ 
        questionId, 
        value: value as string | string[] | number 
      });
    });
  }

  return (
    <OnboardingQuiz
      onComplete={handleQuizComplete}
      onSkip={handleSkip}
      existingAnswers={existingAnswers}
    />
  );
}