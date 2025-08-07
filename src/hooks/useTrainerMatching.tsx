import { useMemo } from 'react';
import { Trainer } from '@/components/TrainerCard';
import { Target, Dumbbell, MapPin, Clock, DollarSign } from 'lucide-react';

interface QuizAnswers {
  fitness_goals?: string[];
  experience_level?: string;
  training_type?: string[];
  session_preference?: string;
  budget_range?: string;
  workout_frequency?: string;
}

interface MatchDetail {
  category: string;
  score: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface MatchScore {
  trainer: Trainer;
  score: number;
  matchReasons: string[];
  matchDetails: MatchDetail[];
}

export const useTrainerMatching = (trainers: Trainer[], userAnswers?: QuizAnswers) => {
  const matchedTrainers = useMemo(() => {
    if (!userAnswers) {
      return trainers.map(trainer => ({
        trainer,
        score: 0,
        matchReasons: [],
        matchDetails: []
      }));
    }

    const calculateMatch = (trainer: Trainer): MatchScore => {
      let score = 0;
      const reasons: string[] = [];
      const details: MatchDetail[] = [];
      
      // Fitness Goals Match (30% weight)
      let goalsScore = 0;
      if (userAnswers.fitness_goals && userAnswers.fitness_goals.length > 0) {
        const userGoals = userAnswers.fitness_goals;
        const goalMapping: Record<string, string[]> = {
          'weight_loss': ['Weight Loss', 'Cardio', 'Nutrition'],
          'muscle_gain': ['Muscle Building', 'Strength Training'],
          'endurance': ['Endurance', 'Cardio', 'Sports Performance'],
          'strength': ['Strength Training', 'Powerlifting', 'Muscle Building'],
          'flexibility': ['Yoga', 'Pilates', 'Flexibility'],
          'general_fitness': ['Functional Training', 'HIIT', 'CrossFit'],
          'rehabilitation': ['Rehabilitation', 'Corrective Exercise'],
          'sport_performance': ['Sports Performance', 'Functional Training']
        };
        
        const matchingGoals = userGoals.filter(goal => {
          const relatedSpecialties = goalMapping[goal] || [];
          return trainer.specialties.some(specialty => 
            relatedSpecialties.some(related => 
              specialty.toLowerCase().includes(related.toLowerCase()) ||
              related.toLowerCase().includes(specialty.toLowerCase())
            )
          );
        }).length;
        
        goalsScore = Math.round((matchingGoals / userGoals.length) * 100);
        score += goalsScore * 0.3;
        
        details.push({
          category: 'Goals',
          score: goalsScore,
          icon: Target,
          color: 'text-blue-500'
        });
        
        if (matchingGoals > 0) {
          reasons.push(`${matchingGoals}/${userGoals.length} goals match`);
        }
      }
      
      // Training Type Match (25% weight)
      let typeScore = 0;
      if (userAnswers.training_type && userAnswers.training_type.length > 0) {
        const typeMapping: Record<string, string[]> = {
          'strength_training': ['Strength Training', 'Powerlifting', 'Muscle Building'],
          'cardio': ['Cardio', 'Endurance'],
          'hiit': ['HIIT', 'CrossFit', 'Functional Training'],
          'yoga': ['Yoga', 'Flexibility', 'Mindfulness'],
          'pilates': ['Pilates', 'Flexibility'],
          'crossfit': ['CrossFit', 'Functional Training'],
          'martial_arts': ['Sports Performance'],
          'dance': ['Cardio', 'Flexibility']
        };
        
        const trainingTypeMatch = userAnswers.training_type.some(type => {
          const relatedSpecialties = typeMapping[type] || [];
          return trainer.specialties.some(specialty => 
            relatedSpecialties.some(related => 
              specialty.toLowerCase().includes(related.toLowerCase()) ||
              related.toLowerCase().includes(specialty.toLowerCase())
            )
          );
        });
        
        typeScore = trainingTypeMatch ? 100 : 0;
        score += typeScore * 0.25;
        
        details.push({
          category: 'Training',
          score: typeScore,
          icon: Dumbbell,
          color: 'text-green-500'
        });
        
        if (trainingTypeMatch) {
          reasons.push('Training type matches');
        }
      }
      
      // Session Preference Match (20% weight)
      let sessionScore = 0;
      if (userAnswers.session_preference) {
        const sessionMapping: Record<string, string[]> = {
          'in_person': ['In-Person'],
          'online': ['Online'],
          'hybrid': ['Hybrid', 'In-Person', 'Online'],
          'group': ['Group']
        };
        
        const preferredTypes = sessionMapping[userAnswers.session_preference] || [];
        const sessionMatch = trainer.trainingType.some(type => 
          preferredTypes.some(pref => 
            type.toLowerCase().includes(pref.toLowerCase())
          )
        );
        
        sessionScore = sessionMatch ? 100 : 0;
        score += sessionScore * 0.2;
        
        details.push({
          category: 'Session',
          score: sessionScore,
          icon: MapPin,
          color: 'text-purple-500'
        });
        
        if (sessionMatch) {
          reasons.push('Session preference matches');
        }
      }
      
      // Budget Match (15% weight)
      let budgetScore = 0;
      if (userAnswers.budget_range) {
        const budgetRanges: Record<string, [number, number]> = {
          '30-50': [30, 50],
          '50-75': [50, 75],
          '75-100': [75, 100],
          '100+': [100, 999]
        };
        
        const [min, max] = budgetRanges[userAnswers.budget_range] || [0, 999];
        // Budget match - check against package price range
        const packagePrices = trainer.package_options?.map((pkg: any) => pkg.price) || [trainer.hourlyRate];
        const minPrice = Math.min(...packagePrices);
        const maxPrice = Math.max(...packagePrices);
        const budgetMatch = maxPrice >= min && minPrice <= max;
        
        budgetScore = budgetMatch ? 100 : 0;
        score += budgetScore * 0.15;
        
        details.push({
          category: 'Budget',
          score: budgetScore,
          icon: DollarSign,
          color: 'text-orange-500'
        });
        
        if (budgetMatch) {
          reasons.push('Within budget range');
        }
      }
      
      // Experience Level Match (10% weight)
      let experienceScore = 0;
      if (userAnswers.experience_level) {
        const experienceMapping: Record<string, boolean> = {
          'beginner': trainer.rating >= 4.8,
          'intermediate': trainer.rating >= 4.5,
          'advanced': parseInt(trainer.experience) >= 8,
          'expert': parseInt(trainer.experience) >= 10
        };
        
        const experienceMatch = experienceMapping[userAnswers.experience_level] || false;
        
        experienceScore = experienceMatch ? 100 : 0;
        score += experienceScore * 0.1;
        
        details.push({
          category: 'Experience',
          score: experienceScore,
          icon: Clock,
          color: 'text-red-500'
        });
        
        if (experienceMatch) {
          reasons.push('Experience level matches');
        }
      }

      return {
        trainer,
        score: Math.round(score),
        matchReasons: reasons,
        matchDetails: details
      };
    };

    const scoredTrainers = trainers.map(calculateMatch);

    // Sort by score (highest first) and then by rating
    return scoredTrainers.sort((a, b) => {
      if (b.score === a.score) {
        return b.trainer.rating - a.trainer.rating;
      }
      return b.score - a.score;
    });
  }, [trainers, userAnswers]);

  return {
    matchedTrainers,
    hasMatches: matchedTrainers.some(match => match.score > 0)
  };
};