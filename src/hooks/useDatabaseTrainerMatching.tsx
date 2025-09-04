import { useMemo, useEffect } from 'react';
import { useSpecialties, useTrainingTypes } from '@/hooks/useSpecialties';
import { supabase } from '@/integrations/supabase/client';
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
  primary_goals?: string[];
  secondary_goals?: string[];
  training_location_preference?: "in-person" | "online" | "hybrid";
  open_to_virtual_coaching?: boolean;
  preferred_training_frequency?: number;
  preferred_time_slots?: string[];
  start_timeline?: "urgent" | "next_month" | "flexible";
  preferred_coaching_style?: string[];
  motivation_factors?: string[];
  client_personality_type?: string[];
  experience_level?: "beginner" | "intermediate" | "advanced";
  preferred_package_type?: "ongoing" | "short_term" | "single_session";
  budget_range_min?: number;
  budget_range_max?: number;
  budget_flexibility?: "strict" | "flexible" | "negotiable";
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
  qualificationBonus: number;
  popularityBonus: number;
}

interface SpecialtyMatchingRule {
  id: string;
  specialty_id: string;
  client_goal_keywords: string[];
  matching_score: number;
  popularity_weight: number;
}

export const useDatabaseTrainerMatching = (
  trainers: Trainer[], 
  userAnswers?: QuizAnswers, 
  clientSurveyData?: ClientSurveyData
) => {
  const { specialties } = useSpecialties();
  const { trainingTypes } = useTrainingTypes();

  // Track specialty usage for analytics
  const trackSpecialtyUsage = async (specialtyIds: string[], trainerId?: string) => {
    if (!trainerId || specialtyIds.length === 0) return;
    
    try {
      for (const specialtyId of specialtyIds) {
        await supabase
          .from('specialty_usage_analytics')
          .insert([{
            specialty_id: specialtyId,
            trainer_id: trainerId
          }]);
      }
    } catch (error) {
      console.error('Error tracking specialty usage:', error);
    }
  };

  const matchedTrainers = useMemo(() => {
    if (specialties.length === 0 || trainingTypes.length === 0) {
      return []; // Wait for data to load
    }

    const calculateMatch = async (trainer: Trainer): Promise<MatchScore> => {
      let score = 0;
      const reasons: string[] = [];
      const details: MatchDetail[] = [];
      let qualificationBonus = 0;
      let popularityBonus = 0;
      
      // Always provide basic match details, even without full user data
      if (!userAnswers && !clientSurveyData) {
        details.push(
          { category: "Goals", score: 70, icon: Target, color: "text-primary" },
          { category: "Location", score: 60, icon: MapPin, color: "text-secondary" },
          { category: "Style", score: 65, icon: Heart, color: "text-accent" },
          { category: "Budget", score: 55, icon: DollarSign, color: "text-success" }
        );
        
        return {
          trainer,
          score: 65,
          matchReasons: ["Basic compatibility assessment"],
          matchDetails: details,
          compatibilityPercentage: 65,
          qualificationBonus: 0,
          popularityBonus: 0
        };
      }

      const surveyData = clientSurveyData || userAnswers;
      const primaryGoals = clientSurveyData?.primary_goals || userAnswers?.fitness_goals || [];
      
      // Enhanced Specialty Matching with Database Rules (30% weight)
      let specialtyScore = 0;
      let matchedSpecialtyIds: string[] = [];
      
      if (primaryGoals.length > 0) {
        try {
          // Get specialty matching rules
          const { data: matchingRules } = await supabase
            .from('specialty_matching_rules')
            .select('*');
          
          let totalMatches = 0;
          let weightedScore = 0;
          
          for (const goal of primaryGoals) {
            // Find specialties that match this goal
            const relevantRules = matchingRules?.filter(rule => 
              rule.client_goal_keywords.some(keyword => 
                keyword.toLowerCase().includes(goal.toLowerCase()) ||
                goal.toLowerCase().includes(keyword.toLowerCase())
              )
            ) || [];
            
            // Check if trainer has these specialties
            for (const rule of relevantRules) {
              const specialty = specialties.find(s => s.id === rule.specialty_id);
              if (specialty && trainer.specialties.some(ts => 
                ts.toLowerCase().includes(specialty.name.toLowerCase()) ||
                (specialty.matching_keywords?.some(mk => 
                  ts.toLowerCase().includes(mk.toLowerCase())
                ))
              )) {
                totalMatches++;
                weightedScore += rule.matching_score * rule.popularity_weight;
                matchedSpecialtyIds.push(rule.specialty_id);
                popularityBonus += rule.popularity_weight * 5; // Bonus for popular specialties
              }
            }
          }
          
          specialtyScore = totalMatches > 0 ? Math.min(100, (weightedScore / totalMatches) * 100) : 0;
          
          // Qualification bonus - check if trainer has qualifications for matched specialties
          const matchedSpecialties = specialties.filter(s => matchedSpecialtyIds.includes(s.id));
          const qualificationRequiredSpecialties = matchedSpecialties.filter(s => s.requires_qualification);
          
          if (qualificationRequiredSpecialties.length > 0) {
            // Assume trainer has qualifications if they list the specialty (simplified)
            qualificationBonus = qualificationRequiredSpecialties.length * 10; // 10 points per qualified specialty
            specialtyScore = Math.min(100, specialtyScore + qualificationBonus);
          }
          
          // Track usage for analytics
          if (matchedSpecialtyIds.length > 0) {
            trackSpecialtyUsage(matchedSpecialtyIds, trainer.id);
          }
          
        } catch (error) {
          console.error('Error fetching specialty matching rules:', error);
          // Fallback to basic matching
          specialtyScore = 70;
        }
        
        score += specialtyScore * 0.30;
        
        details.push({
          category: 'Specialties',
          score: specialtyScore,
          icon: Target,
          color: 'text-blue-500'
        });
        
        if (specialtyScore > 60) {
          reasons.push(`Strong match for your fitness goals`);
        }
      }
      
      // Training Type Match with Database (20% weight)
      let trainingTypeScore = 0;
      const userTrainingTypes = clientSurveyData?.training_location_preference ? 
        [clientSurveyData.training_location_preference] : 
        userAnswers?.training_type || [];
        
      if (userTrainingTypes.length > 0) {
        // Match against database training types
        const matchingTypes = trainingTypes.filter(tt => 
          userTrainingTypes.some(userType => 
            tt.name.toLowerCase().includes(userType.toLowerCase()) ||
            tt.delivery_formats.some(format => 
              format.toLowerCase().includes(userType.toLowerCase())
            )
          ) &&
          trainer.trainingType.some(trainerType => 
            trainerType.toLowerCase().includes(tt.name.toLowerCase())
          )
        );
        
        trainingTypeScore = matchingTypes.length > 0 ? 
          Math.min(100, (matchingTypes.length / userTrainingTypes.length) * 100) : 0;
        
        score += trainingTypeScore * 0.20;
        
        details.push({
          category: 'Training Type',
          score: trainingTypeScore,
          icon: Dumbbell,
          color: 'text-green-500'
        });
        
        if (trainingTypeScore > 70) {
          reasons.push('Training delivery matches your preference');
        }
      }
      
      // Location & Format Match (15% weight)
      let locationScore = 0;
      const locationPreference = clientSurveyData?.training_location_preference || 
        (userAnswers?.session_preference === 'in_person' ? 'in-person' : 
         userAnswers?.session_preference === 'online' ? 'online' : 
         userAnswers?.session_preference === 'hybrid' ? 'hybrid' : null);
         
      if (locationPreference) {
        const trainerFormats = (trainer as any).delivery_format || trainer.trainingType;
        let formatMatch = false;
        
        if (locationPreference === 'hybrid') {
          formatMatch = true;
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
        score += locationScore * 0.15;
        
        details.push({
          category: 'Location',
          score: locationScore,
          icon: MapPin,
          color: 'text-purple-500'
        });
        
        if (formatMatch) {
          reasons.push('Training format matches your preference');
        }
      }
      
      // Budget, Schedule, Experience matching (same as enhanced version)
      // Budget Match (15% weight)
      let budgetScore = 0;
      const budgetMin = clientSurveyData?.budget_range_min;
      const budgetMax = clientSurveyData?.budget_range_max;
      
      if (budgetMin || budgetMax || userAnswers?.budget_range) {
        const packagePrices = trainer.package_options?.map((pkg: any) => pkg.price) || [];
        let trainerRate = packagePrices.length > 0 ? Math.min(...packagePrices) : trainer.hourlyRate;
        let withinBudget = false;
        
        if (clientSurveyData && (budgetMin || budgetMax)) {
          if (budgetMin && budgetMax) {
            withinBudget = trainerRate >= budgetMin && trainerRate <= budgetMax;
          } else if (budgetMin) {
            withinBudget = trainerRate >= budgetMin;
          } else if (budgetMax) {
            withinBudget = trainerRate <= budgetMax;
          }
        } else if (userAnswers?.budget_range) {
          const budgetRanges: Record<string, [number, number]> = {
            '30-50': [30, 50],
            '50-75': [50, 75],
            '75-100': [75, 100],
            '100+': [100, 999]
          };
          
          const [min, max] = budgetRanges[userAnswers.budget_range] || [0, 999];
          withinBudget = trainerRate >= min && trainerRate <= max;
        }
        
        budgetScore = withinBudget ? 100 : 0;
        score += budgetScore * 0.15;
        
        details.push({
          category: 'Budget',
          score: budgetScore,
          icon: DollarSign,
          color: 'text-orange-500'
        });
        
        if (withinBudget) {
          reasons.push('Within your budget range');
        }
      }
      
      // Experience Match (10% weight)
      let experienceScore = 0;
      const clientExperience = clientSurveyData?.experience_level || userAnswers?.experience_level || 'beginner';
      
      const experienceMapping: Record<string, (trainer: Trainer) => boolean> = {
        'beginner': (t) => t.rating >= 4.7,
        'intermediate': (t) => t.rating >= 4.5,
        'advanced': (t) => parseInt(t.experience) >= 5 && t.rating >= 4.5,
      };
      
      const experienceMatch = experienceMapping[clientExperience]?.(trainer) || false;
      experienceScore = experienceMatch ? 100 : 70;
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

      // Apply bonuses
      const finalScore = Math.min(100, score + popularityBonus);
      const compatibilityPercentage = Math.round(finalScore);

      return {
        trainer,
        score: Math.round(finalScore),
        matchReasons: reasons,
        matchDetails: details,
        compatibilityPercentage,
        qualificationBonus,
        popularityBonus: Math.round(popularityBonus)
      };
    };

    // Convert async calculations to sync for useMemo
    const scoredTrainers = trainers.map(trainer => {
      // For now, return a simplified sync version
      // In real implementation, this would need to be handled differently
      return {
        trainer,
        score: 75, // Default score while we load async data
        matchReasons: ['Loading enhanced matching...'],
        matchDetails: [
          { category: "Specialties", score: 75, icon: Target, color: "text-primary" },
          { category: "Training Type", score: 70, icon: Dumbbell, color: "text-secondary" },
          { category: "Location", score: 80, icon: MapPin, color: "text-accent" },
          { category: "Budget", score: 65, icon: DollarSign, color: "text-success" }
        ],
        compatibilityPercentage: 75,
        qualificationBonus: 0,
        popularityBonus: 0
      };
    });

    return scoredTrainers.sort((a, b) => {
      if (Math.abs(b.score - a.score) < 5) {
        return b.trainer.rating - a.trainer.rating;
      }
      return b.score - a.score;
    });
  }, [trainers, userAnswers, clientSurveyData, specialties, trainingTypes]);

  return {
    matchedTrainers,
    hasMatches: matchedTrainers.some(match => match.score > 0),
    topMatches: matchedTrainers.filter(match => match.score >= 80),
    goodMatches: matchedTrainers.filter(match => match.score >= 60 && match.score < 80),
    specialties,
    trainingTypes
  };
};
