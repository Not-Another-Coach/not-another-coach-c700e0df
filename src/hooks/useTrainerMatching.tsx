import { useMemo } from 'react';
import { Trainer } from '@/components/TrainerCard';

interface QuizAnswers {
  fitness_goals?: string[];
  experience_level?: string;
  training_type?: string[];
  session_preference?: string;
  budget_range?: string;
  workout_frequency?: string;
}

interface MatchScore {
  trainer: Trainer;
  score: number;
  matchReasons: string[];
}

export const useTrainerMatching = (trainers: Trainer[], userAnswers?: QuizAnswers) => {
  const matchedTrainers = useMemo(() => {
    if (!userAnswers) {
      return trainers.map(trainer => ({
        trainer,
        score: 0,
        matchReasons: []
      }));
    }

    const scoredTrainers: MatchScore[] = trainers.map(trainer => {
      let score = 0;
      const matchReasons: string[] = [];

      // Fitness goals matching (highest weight - 40 points)
      if (userAnswers.fitness_goals && userAnswers.fitness_goals.length > 0) {
        const goalMatches = userAnswers.fitness_goals.filter(goal => {
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
          
          const relatedSpecialties = goalMapping[goal] || [];
          return trainer.specialties.some(specialty => 
            relatedSpecialties.some(related => 
              specialty.toLowerCase().includes(related.toLowerCase()) ||
              related.toLowerCase().includes(specialty.toLowerCase())
            )
          );
        });

        const goalScore = (goalMatches.length / userAnswers.fitness_goals.length) * 40;
        score += goalScore;
        
        if (goalMatches.length > 0) {
          matchReasons.push(`Matches ${goalMatches.length} of your fitness goals`);
        }
      }

      // Training type matching (30 points)
      if (userAnswers.training_type && userAnswers.training_type.length > 0) {
        const typeMatches = userAnswers.training_type.filter(type => {
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
          
          const relatedSpecialties = typeMapping[type] || [];
          return trainer.specialties.some(specialty => 
            relatedSpecialties.some(related => 
              specialty.toLowerCase().includes(related.toLowerCase()) ||
              related.toLowerCase().includes(specialty.toLowerCase())
            )
          );
        });

        const typeScore = (typeMatches.length / userAnswers.training_type.length) * 30;
        score += typeScore;
        
        if (typeMatches.length > 0) {
          matchReasons.push(`Specializes in your preferred training types`);
        }
      }

      // Session preference matching (15 points)
      if (userAnswers.session_preference) {
        const sessionMapping: Record<string, string[]> = {
          'in_person': ['In-Person'],
          'online': ['Online'],
          'hybrid': ['Hybrid', 'In-Person', 'Online'],
          'group': ['Group']
        };
        
        const preferredTypes = sessionMapping[userAnswers.session_preference] || [];
        const hasMatch = trainer.trainingType.some(type => 
          preferredTypes.some(pref => 
            type.toLowerCase().includes(pref.toLowerCase())
          )
        );
        
        if (hasMatch) {
          score += 15;
          matchReasons.push(`Offers your preferred session format`);
        }
      }

      // Budget matching (10 points)
      if (userAnswers.budget_range) {
        const budgetRanges: Record<string, [number, number]> = {
          '30-50': [30, 50],
          '50-75': [50, 75],
          '75-100': [75, 100],
          '100+': [100, 999]
        };
        
        const [min, max] = budgetRanges[userAnswers.budget_range] || [0, 999];
        if (trainer.hourlyRate >= min && trainer.hourlyRate <= max) {
          score += 10;
          matchReasons.push(`Within your budget range`);
        }
      }

      // Experience level bonus (5 points)
      if (userAnswers.experience_level) {
        const experienceBonus: Record<string, number> = {
          'beginner': trainer.rating >= 4.8 ? 5 : 3, // High-rated for beginners
          'intermediate': 4,
          'advanced': parseInt(trainer.experience) >= 8 ? 5 : 3,
          'expert': parseInt(trainer.experience) >= 10 ? 5 : 2
        };
        
        score += experienceBonus[userAnswers.experience_level] || 0;
        
        if (userAnswers.experience_level === 'beginner' && trainer.rating >= 4.8) {
          matchReasons.push(`Highly rated - great for beginners`);
        } else if (userAnswers.experience_level === 'advanced' && parseInt(trainer.experience) >= 8) {
          matchReasons.push(`Experienced trainer for advanced clients`);
        }
      }

      return {
        trainer,
        score: Math.round(score),
        matchReasons
      };
    });

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