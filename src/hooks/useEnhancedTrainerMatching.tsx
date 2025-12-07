import { useMemo } from 'react';
import { Trainer } from '@/types/trainer';
import { Target, MapPin, Clock, DollarSign, Heart, Users, Calendar } from 'lucide-react';
import { useMatchingConfig } from './useMatchingConfig';
import { applyHardExclusions, ExcludedTrainer, ExclusionSummary, HARD_EXCLUSION_RULES } from './useHardExclusions';
import { useLiveMatchingVersion } from './useMatchingVersions';
import { useGoalSpecialtyMappingsForMatching, GoalMappingsLookup } from './useGoalSpecialtyMappingsForMatching';
import { DEFAULT_MATCHING_CONFIG } from '@/types/matching';
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
  start_timeline?: "asap" | "within_month" | "flexible";
  
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
  
  // Trainer preferences (new fields)
  trainer_gender_preference?: "male" | "female" | "no_preference";
  discovery_call_preference?: "required" | "prefer_no" | "flexible";
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

export interface EnhancedMatchingResult {
  matchedTrainers: MatchScore[];
  excludedTrainers: ExcludedTrainer[];
  exclusionSummary: ExclusionSummary;
  hasMatches: boolean;
  topMatches: MatchScore[];
  goodMatches: MatchScore[];
  allTrainers: MatchScore[];
}

export { HARD_EXCLUSION_RULES } from './useHardExclusions';

export const useEnhancedTrainerMatching = (
  trainers: Trainer[], 
  userAnswers?: QuizAnswers, 
  clientSurveyData?: ClientSurveyData
): EnhancedMatchingResult => {
  const { config } = useMatchingConfig();
  
  // Fetch live matching config for weight percentages
  const { data: liveVersion } = useLiveMatchingVersion();
  const liveWeights = liveVersion?.config?.weights || DEFAULT_MATCHING_CONFIG.weights;
  
  // Fetch goal-specialty mappings from database
  const { data: goalMappings } = useGoalSpecialtyMappingsForMatching();
  const dbGoalMappings: GoalMappingsLookup = goalMappings || {};
  
  // Apply hard exclusions first
  const { includedTrainers, excludedTrainers, exclusionSummary } = useMemo(() => {
    return applyHardExclusions(trainers, clientSurveyData, config);
  }, [trainers, clientSurveyData, config]);

  const matchedTrainers = useMemo(() => {
    // PHASE 2 IMPROVEMENT: Ensure minimum baseline score for all trainers
    const MINIMUM_BASELINE_SCORE = 45; // All trainers get at least 45% compatibility
    
    const calculateMatch = (trainer: Trainer): MatchScore => {
      let score = 0;
      const reasons: string[] = [];
      const details: MatchDetail[] = [];
      
      // Always provide basic match details, even without full user data
      if (!userAnswers && !clientSurveyData) {
        // Provide varied baseline scores to create diversity
        const baselineVariation = Math.random() * 20 + 50; // 50-70% range
        const goalsScore = Math.floor(Math.random() * 30 + 60); // 60-90%
        const locationScore = Math.floor(Math.random() * 40 + 50); // 50-90%
        const availabilityScore = Math.floor(Math.random() * 30 + 55); // 55-85%
        const budgetScore = Math.floor(Math.random() * 35 + 45); // 45-80%
        
        details.push(
          { category: "Goals", score: goalsScore, icon: Target, color: "text-primary" },
          { category: "Location", score: locationScore, icon: MapPin, color: "text-secondary" },
          { category: "Availability", score: availabilityScore, icon: Clock, color: "text-accent" },
          { category: "Budget", score: budgetScore, icon: DollarSign, color: "text-success" }
        );
        
        return {
          trainer,
          score: Math.max(Math.floor(baselineVariation), MINIMUM_BASELINE_SCORE),
          matchReasons: [`Compatible with your fitness journey`, `Experienced ${trainer.experience} trainer`, `Specializes in ${trainer.specialties.slice(0, 2).join(' & ')}`],
          matchDetails: details,
          compatibilityPercentage: Math.max(Math.floor(baselineVariation), MINIMUM_BASELINE_SCORE)
        };
      }

      // Use new client survey data if available, otherwise fallback to old quiz
      const surveyData = clientSurveyData || userAnswers;
      
      // Goals Match - Uses LIVE config weights and DATABASE goal-specialty mappings
      let goalsScore = 0;
      const primaryGoals = clientSurveyData?.primary_goals || userAnswers?.fitness_goals || [];
      
      if (primaryGoals.length > 0) {
        // Use database mappings with weighted scoring (100/60/30 for primary/secondary/optional)
        let totalWeightedScore = 0;
        let maxPossibleScore = 0;
        
        primaryGoals.forEach(goal => {
          const mappings = dbGoalMappings[goal] || [];
          
          if (mappings.length === 0) {
            // No mappings in DB for this goal - fallback behavior
            maxPossibleScore += 100;
            return;
          }
          
          // Find the best matching specialty for this goal
          let bestMatchWeight = 0;
          mappings.forEach(mapping => {
            const hasMatch = trainer.specialties.some(specialty => 
              specialty.toLowerCase().includes(mapping.specialty.toLowerCase()) ||
              mapping.specialty.toLowerCase().includes(specialty.toLowerCase())
            );
            if (hasMatch && mapping.weight > bestMatchWeight) {
              bestMatchWeight = mapping.weight;
            }
          });
          
          maxPossibleScore += 100; // Max possible is always 100 per goal
          totalWeightedScore += bestMatchWeight; // Add the best match weight (0, 30, 60, or 100)
        });
        
        goalsScore = maxPossibleScore > 0 ? Math.round((totalWeightedScore / maxPossibleScore) * 100) : 0;
        score += goalsScore * (liveWeights.goals_specialties.value / 100);
        
        details.push({
          category: 'Goals',
          score: goalsScore,
          icon: Target,
          color: 'text-blue-500'
        });
        
        const matchingGoals = primaryGoals.filter(goal => {
          const mappings = dbGoalMappings[goal] || [];
          return mappings.some(mapping => 
            trainer.specialties.some(specialty => 
              specialty.toLowerCase().includes(mapping.specialty.toLowerCase()) ||
              mapping.specialty.toLowerCase().includes(specialty.toLowerCase())
            )
          );
        }).length;
        
        if (matchingGoals > 0) {
          reasons.push(`${matchingGoals}/${primaryGoals.length} goals align with expertise`);
        }
      }
      
      // Training Location & Format Match - Uses LIVE config weights
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
        score += locationScore * (liveWeights.location_format.value / 100);
        
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
      
      // Coaching Style Match - Uses LIVE config weights
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
        score += styleScore * (liveWeights.coaching_style.value / 100);
        
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
      
      // Schedule & Frequency Match - Uses LIVE config weights
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
        
        score += scheduleScore * (liveWeights.schedule_frequency.value / 100);
        
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
      
      // Budget Match - Uses LIVE config weights
      let budgetScore = 0;
      const budgetMin = clientSurveyData?.budget_range_min;
      const budgetMax = clientSurveyData?.budget_range_max;
      const budgetFlex = clientSurveyData?.budget_flexibility;
      
      if (budgetMin || budgetMax || userAnswers?.budget_range) {
        // Get trainer rate from packages or fallback to hourly rate
        const packagePrices = trainer.package_options?.map((pkg: any) => pkg.price) || [];
        let trainerRate = packagePrices.length > 0 ? Math.min(...packagePrices) : trainer.hourlyRate;
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
        score += budgetScore * (liveWeights.budget_fit.value / 100);
        
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
      
      // Experience & Client Fit Match - Uses LIVE config weights
      let experienceScore = 0;
      const clientExperience = clientSurveyData?.experience_level || userAnswers?.experience_level || 'beginner';
      
      const experienceMapping: Record<string, (trainer: Trainer) => boolean> = {
        'beginner': (t) => t.rating >= 4.7, // Patient, highly rated trainers
        'intermediate': (t) => t.rating >= 4.5, // Good trainers
        'advanced': (t) => parseInt(t.experience) >= 5 && t.rating >= 4.5, // Experienced trainers
      };
      
      const experienceMatch = experienceMapping[clientExperience]?.(trainer) || false;
      experienceScore = experienceMatch ? 100 : 70;
      score += experienceScore * (liveWeights.experience_level.value / 100);
      
      details.push({
        category: 'Experience',
        score: experienceScore,
        icon: Users,
        color: 'text-red-500'
      });
      
      if (experienceMatch) {
        reasons.push(`Perfect fit for ${clientExperience} level`);
      }

      // Trainer Gender Preference Match (filter, not scored)
      const trainerGenderPref = clientSurveyData?.trainer_gender_preference;
      const trainerGender = (trainer as any).gender; // From profiles.gender
      
      if (trainerGenderPref && trainerGenderPref !== 'no_preference' && trainerGender) {
        // If client has a preference and trainer's gender doesn't match, significantly reduce score
        if (trainerGender !== trainerGenderPref) {
          score = score * 0.3; // Reduce to 30% - still show but much lower
          reasons.push(`Gender preference not matched`);
        } else {
          reasons.push(`Matches your trainer gender preference`);
        }
      }

      // Discovery Call Preference (bonus/penalty)
      const discoveryCallPref = clientSurveyData?.discovery_call_preference;
      const trainerOffersDiscovery = (trainer as any).offers_discovery_call ?? (trainer as any).free_discovery_call;
      
      if (discoveryCallPref === 'required' && trainerOffersDiscovery === false) {
        score = score * 0.8; // 20% penalty if client wants discovery but trainer doesn't offer
      } else if (discoveryCallPref === 'required' && trainerOffersDiscovery === true) {
        score = Math.min(score * 1.1, 100); // 10% bonus for matching
        reasons.push(`Offers discovery calls`);
      }

      // PHASE 2 IMPROVEMENT: Ensure minimum baseline score  
      const finalScore = Math.max(Math.round(score), MINIMUM_BASELINE_SCORE);
      
      // Add baseline reasons if score is low
      if (reasons.length === 0) {
        reasons.push(`Compatible trainer with ${trainer.experience} experience`);
        reasons.push(`Specializes in ${trainer.specialties.slice(0, 2).join(' & ')}`);
      }

      // Calculate compatibility percentage (0-100%)
      const compatibilityPercentage = finalScore;

      return {
        trainer,
        score: finalScore,
        matchReasons: reasons,
        matchDetails: details,
        compatibilityPercentage
      };
    };

    // Score only included trainers (after hard exclusions)
    const scoredTrainers = includedTrainers.map(calculateMatch);

    // PHASE 2 IMPROVEMENT: Implement trainer diversity algorithm
    const implementTrainerDiversity = (trainers: MatchScore[]) => {
      // Sort by score first
      const sortedByScore = [...trainers].sort((a, b) => {
        if (Math.abs(b.score - a.score) < 3) { // If scores are very close (within 3 points)
          return b.trainer.rating - a.trainer.rating; // Sort by rating
        }
        return b.score - a.score;
      });

      // Create diversity buckets
      const highScorers = sortedByScore.filter(t => t.score >= 75);
      const mediumScorers = sortedByScore.filter(t => t.score >= 60 && t.score < 75);
      const lowerScorers = sortedByScore.filter(t => t.score < 60);

      // Shuffle within each bucket to add variety
      const shuffleBucket = (bucket: MatchScore[]) => {
        const shuffled = [...bucket];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      // Interleave trainers from different buckets for diversity
      const diverseOrder = [];
      const buckets = [
        shuffleBucket(highScorers),
        shuffleBucket(mediumScorers), 
        shuffleBucket(lowerScorers)
      ];

      let bucketIndex = 0;
      while (buckets.some(bucket => bucket.length > 0)) {
        const currentBucket = buckets[bucketIndex % buckets.length];
        if (currentBucket.length > 0) {
          diverseOrder.push(currentBucket.shift()!);
        }
        bucketIndex++;
      }

      return diverseOrder;
    };

    // Apply diversity algorithm
    return implementTrainerDiversity(scoredTrainers);
  }, [includedTrainers, userAnswers, clientSurveyData, dbGoalMappings, liveWeights]);

  return {
    matchedTrainers,
    excludedTrainers,
    exclusionSummary,
    hasMatches: matchedTrainers.length > 0,
    topMatches: matchedTrainers.filter(match => match.score >= 70),
    goodMatches: matchedTrainers.filter(match => match.score >= 50 && match.score < 70),
    allTrainers: matchedTrainers,
  };
};