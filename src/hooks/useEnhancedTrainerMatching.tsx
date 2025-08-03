import { useMemo } from 'react';
import { Trainer } from '@/components/TrainerCard';
import { Target, Dumbbell, MapPin, Clock, DollarSign, Heart, Users, Calendar } from 'lucide-react';

interface QuizAnswers {
  fitness_goals?: string[];
  experience_level?: string;
  training_type?: string[];
  session_preference?: string;
  budget_range?: string;
  workout_frequency?: string;
}

interface ClientSurveyData {
  // Goals and preferences
  primary_goals?: string[];
  secondary_goals?: string[];
  
  // Training location and format
  training_location_preference?: "in-person" | "online" | "hybrid";
  open_to_virtual_coaching?: boolean;
  
  // Training frequency and scheduling
  preferred_training_frequency?: number;
  preferred_time_slots?: string[];
  start_timeline?: "urgent" | "next_month" | "flexible";
  
  // Coaching style preferences
  preferred_coaching_style?: string[];
  motivation_factors?: string[];
  
  // Client self-description
  client_personality_type?: string[];
  experience_level?: "beginner" | "intermediate" | "advanced";
  
  // Package and budget preferences
  preferred_package_type?: "ongoing" | "short_term" | "single_session";
  budget_range_min?: number;
  budget_range_max?: number;
  budget_flexibility?: "strict" | "flexible" | "negotiable";
  
  // Waitlist and availability preferences
  waitlist_preference?: "asap" | "quality_over_speed";
  flexible_scheduling?: boolean;
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
  compatibilityPercentage: number;
}

export const useEnhancedTrainerMatching = (trainers: Trainer[], userAnswers?: QuizAnswers, clientSurveyData?: ClientSurveyData) => {
  const matchedTrainers = useMemo(() => {
    if (!userAnswers && !clientSurveyData) {
      return trainers.map(trainer => ({
        trainer,
        score: 0,
        matchReasons: [],
        matchDetails: [],
        compatibilityPercentage: 0
      }));
    }

    const calculateMatch = (trainer: Trainer): MatchScore => {
      let score = 0;
      const reasons: string[] = [];
      const details: MatchDetail[] = [];
      
      // Use new client survey data if available, otherwise fallback to old quiz
      const surveyData = clientSurveyData || userAnswers;
      
      // Goals Match (25% weight) - Enhanced for new survey
      let goalsScore = 0;
      const primaryGoals = clientSurveyData?.primary_goals || userAnswers?.fitness_goals || [];
      
      if (primaryGoals.length > 0) {
        const goalMapping: Record<string, string[]> = {
          'weight_loss': ['Weight Loss', 'Fat Loss', 'Body Composition', 'Nutrition'],
          'strength_training': ['Strength Training', 'Powerlifting', 'Muscle Building', 'Bodybuilding'],
          'fitness_health': ['General Fitness', 'Health & Wellness', 'Functional Training'],
          'energy_confidence': ['Lifestyle Coaching', 'Motivation', 'Confidence Building'],
          'injury_prevention': ['Rehabilitation', 'Corrective Exercise', 'Injury Prevention', 'Mobility'],
          'specific_sport': ['Sports Performance', 'Athletic Training', 'Sport-Specific'],
          'muscle_gain': ['Muscle Building', 'Strength Training', 'Bodybuilding'],
          'endurance': ['Endurance', 'Cardio', 'Marathon Training'],
          'flexibility': ['Yoga', 'Pilates', 'Flexibility', 'Mobility'],
          'general_fitness': ['Functional Training', 'HIIT', 'CrossFit'],
          'rehabilitation': ['Rehabilitation', 'Corrective Exercise', 'Physical Therapy']
        };
        
        const matchingGoals = primaryGoals.filter(goal => {
          const relatedSpecialties = goalMapping[goal] || [];
          return trainer.specialties.some(specialty => 
            relatedSpecialties.some(related => 
              specialty.toLowerCase().includes(related.toLowerCase()) ||
              related.toLowerCase().includes(specialty.toLowerCase())
            )
          );
        }).length;
        
        goalsScore = Math.round((matchingGoals / primaryGoals.length) * 100);
        score += goalsScore * 0.25;
        
        details.push({
          category: 'Goals',
          score: goalsScore,
          icon: Target,
          color: 'text-blue-500'
        });
        
        if (matchingGoals > 0) {
          reasons.push(`${matchingGoals}/${primaryGoals.length} goals align with expertise`);
        }
      }
      
      // Training Location & Format Match (20% weight)
      let locationScore = 0;
      const locationPreference = clientSurveyData?.training_location_preference || 
        (userAnswers?.session_preference === 'in_person' ? 'in-person' : 
         userAnswers?.session_preference === 'online' ? 'online' : 
         userAnswers?.session_preference === 'hybrid' ? 'hybrid' : null);
         
      if (locationPreference) {
        const trainerFormats = (trainer as any).delivery_format || trainer.trainingType;
        let formatMatch = false;
        
        if (locationPreference === 'hybrid') {
          formatMatch = true; // Hybrid clients are flexible
        } else if (locationPreference === 'online') {
          formatMatch = trainerFormats.some((format: string) => 
            format.toLowerCase().includes('online') || format.toLowerCase().includes('virtual')
          );
        } else if (locationPreference === 'in-person') {
          formatMatch = trainerFormats.some((format: string) => 
            format.toLowerCase().includes('person') || format.toLowerCase().includes('gym')
          );
        }
        
        locationScore = formatMatch ? 100 : (clientSurveyData?.open_to_virtual_coaching ? 70 : 0);
        score += locationScore * 0.20;
        
        details.push({
          category: 'Location',
          score: locationScore,
          icon: MapPin,
          color: 'text-green-500'
        });
        
        if (formatMatch) {
          reasons.push('Training format matches your preference');
        }
      }
      
      // Coaching Style Match (20% weight) - New from survey
      let styleScore = 0;
      if (clientSurveyData?.preferred_coaching_style?.length) {
        const styleMapping: Record<string, string[]> = {
          'nurturing': ['supportive', 'patient', 'encouraging', 'nurturing'],
          'tough_love': ['challenging', 'direct', 'accountability', 'strict'],
          'high_energy': ['energetic', 'motivating', 'enthusiastic', 'dynamic'],
          'analytical': ['technical', 'data-driven', 'precise', 'scientific'],
          'social': ['fun', 'social', 'interactive', 'group'],
          'calm': ['calm', 'mindful', 'peaceful', 'balanced']
        };
        
        const trainerVibe = (trainer as any).training_vibe || '';
        const trainerStyle = (trainer as any).communication_style || '';
        const trainerText = `${trainerVibe} ${trainerStyle}`.toLowerCase();
        
        const styleMatches = clientSurveyData.preferred_coaching_style.filter(style => {
          const keywords = styleMapping[style] || [];
          return keywords.some(keyword => trainerText.includes(keyword));
        }).length;
        
        styleScore = Math.round((styleMatches / clientSurveyData.preferred_coaching_style.length) * 100);
        score += styleScore * 0.20;
        
        details.push({
          category: 'Style',
          score: styleScore,
          icon: Heart,
          color: 'text-purple-500'
        });
        
        if (styleMatches > 0) {
          reasons.push(`Coaching style matches your preferences`);
        }
      }
      
      // Schedule & Frequency Match (15% weight)
      let scheduleScore = 0;
      const preferredFrequency = clientSurveyData?.preferred_training_frequency || 
        (userAnswers?.workout_frequency === 'daily' ? 7 :
         userAnswers?.workout_frequency === '4-6_times' ? 5 :
         userAnswers?.workout_frequency === '2-3_times' ? 3 : 2);
         
      if (preferredFrequency) {
        // Assume trainers can accommodate most frequencies (basic match)
        scheduleScore = 85; // Default good match for scheduling
        
        if (clientSurveyData?.flexible_scheduling) {
          scheduleScore = 100; // Bonus for flexible clients
        }
        
        score += scheduleScore * 0.15;
        
        details.push({
          category: 'Schedule',
          score: scheduleScore,
          icon: Calendar,
          color: 'text-cyan-500'
        });
        
        if (scheduleScore >= 85) {
          reasons.push(`Can accommodate ${preferredFrequency}x/week training`);
        }
      }
      
      // Budget Match (10% weight) - Enhanced
      let budgetScore = 0;
      const budgetMin = clientSurveyData?.budget_range_min;
      const budgetMax = clientSurveyData?.budget_range_max;
      const budgetFlex = clientSurveyData?.budget_flexibility;
      
      if (budgetMin || budgetMax || userAnswers?.budget_range) {
        let trainerRate = trainer.hourlyRate;
        let withinBudget = false;
        
        if (clientSurveyData && (budgetMin || budgetMax)) {
          // New survey budget logic
          if (budgetMin && budgetMax) {
            withinBudget = trainerRate >= budgetMin && trainerRate <= budgetMax;
          } else if (budgetMin) {
            withinBudget = trainerRate >= budgetMin;
          } else if (budgetMax) {
            withinBudget = trainerRate <= budgetMax;
          }
          
          // Adjust for flexibility
          if (!withinBudget && budgetFlex === 'flexible') {
            const tolerance = budgetMax ? budgetMax * 0.2 : budgetMin ? budgetMin * 0.2 : 20;
            withinBudget = Math.abs(trainerRate - (budgetMax || budgetMin || 0)) <= tolerance;
          }
        } else if (userAnswers?.budget_range) {
          // Old quiz budget logic
          const budgetRanges: Record<string, [number, number]> = {
            '30-50': [30, 50],
            '50-75': [50, 75],
            '75-100': [75, 100],
            '100+': [100, 999]
          };
          
          const [min, max] = budgetRanges[userAnswers.budget_range] || [0, 999];
          withinBudget = trainerRate >= min && trainerRate <= max;
        }
        
        budgetScore = withinBudget ? 100 : (budgetFlex === 'negotiable' ? 60 : 0);
        score += budgetScore * 0.10;
        
        details.push({
          category: 'Budget',
          score: budgetScore,
          icon: DollarSign,
          color: 'text-orange-500'
        });
        
        if (withinBudget) {
          reasons.push('Within your budget range');
        } else if (budgetFlex === 'negotiable') {
          reasons.push('May negotiate on pricing');
        }
      }
      
      // Experience & Client Fit Match (10% weight) - Enhanced
      let experienceScore = 0;
      const clientExperience = clientSurveyData?.experience_level || userAnswers?.experience_level || 'beginner';
      
      const experienceMapping: Record<string, (trainer: Trainer) => boolean> = {
        'beginner': (t) => t.rating >= 4.7, // Patient, highly rated trainers
        'intermediate': (t) => t.rating >= 4.5, // Good trainers
        'advanced': (t) => parseInt(t.experience) >= 5 && t.rating >= 4.5, // Experienced trainers
      };
      
      const experienceMatch = experienceMapping[clientExperience]?.(trainer) || false;
      experienceScore = experienceMatch ? 100 : 70; // Most trainers can work with different levels
      score += experienceScore * 0.10;
      
      details.push({
        category: 'Experience',
        score: experienceScore,
        icon: Users,
        color: 'text-red-500'
      });
      
      if (experienceMatch) {
        reasons.push(`Perfect fit for ${clientExperience} level`);
      }

      // Calculate compatibility percentage (0-100%)
      const compatibilityPercentage = Math.round(score);

      return {
        trainer,
        score: Math.round(score),
        matchReasons: reasons,
        matchDetails: details,
        compatibilityPercentage
      };
    };

    const scoredTrainers = trainers.map(calculateMatch);

    // Sort by score (highest first) and then by rating
    return scoredTrainers.sort((a, b) => {
      if (Math.abs(b.score - a.score) < 5) { // If scores are very close
        return b.trainer.rating - a.trainer.rating; // Sort by rating
      }
      return b.score - a.score;
    });
  }, [trainers, userAnswers, clientSurveyData]);

  return {
    matchedTrainers,
    hasMatches: matchedTrainers.some(match => match.score > 0),
    topMatches: matchedTrainers.filter(match => match.score >= 70), // High compatibility matches
    goodMatches: matchedTrainers.filter(match => match.score >= 50 && match.score < 70), // Good matches
  };
};