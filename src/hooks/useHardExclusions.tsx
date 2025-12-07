import { Trainer } from '@/types/trainer';
import { MatchingAlgorithmConfig } from './useMatchingConfig';

export type ExclusionType = 'gender' | 'format' | 'budget' | 'availability';

export interface ExcludedTrainer {
  trainer: Trainer;
  reason: string;
  exclusionType: ExclusionType;
}

export interface ExclusionSummary {
  gender: number;
  format: number;
  budget: number;
  availability: number;
  total: number;
}

export interface ClientSurveyData {
  trainer_gender_preference?: 'male' | 'female' | 'no_preference';
  training_location_preference?: 'in-person' | 'online' | 'hybrid';
  open_to_virtual_coaching?: boolean;
  budget_range_max?: number;
  budget_flexibility?: 'strict' | 'flexible' | 'negotiable';
  start_timeline?: 'asap' | 'within_month' | 'flexible';
}

export interface HardExclusionResult {
  includedTrainers: Trainer[];
  excludedTrainers: ExcludedTrainer[];
  exclusionSummary: ExclusionSummary;
}

export function applyHardExclusions(
  trainers: Trainer[],
  clientSurveyData: ClientSurveyData | undefined,
  config: MatchingAlgorithmConfig | null
): HardExclusionResult {
  // If no config or hard exclusions disabled, return all trainers
  if (!config?.feature_flags?.enable_hard_exclusions || !clientSurveyData) {
    return {
      includedTrainers: trainers,
      excludedTrainers: [],
      exclusionSummary: { gender: 0, format: 0, budget: 0, availability: 0, total: 0 }
    };
  }

  const includedTrainers: Trainer[] = [];
  const excludedTrainers: ExcludedTrainer[] = [];

  for (const trainer of trainers) {
    const exclusion = checkExclusion(trainer, clientSurveyData, config);
    
    if (exclusion) {
      excludedTrainers.push({
        trainer,
        reason: exclusion.reason,
        exclusionType: exclusion.type
      });
    } else {
      includedTrainers.push(trainer);
    }
  }

  const exclusionSummary: ExclusionSummary = {
    gender: excludedTrainers.filter(e => e.exclusionType === 'gender').length,
    format: excludedTrainers.filter(e => e.exclusionType === 'format').length,
    budget: excludedTrainers.filter(e => e.exclusionType === 'budget').length,
    availability: excludedTrainers.filter(e => e.exclusionType === 'availability').length,
    total: excludedTrainers.length
  };

  return { includedTrainers, excludedTrainers, exclusionSummary };
}

function checkExclusion(
  trainer: Trainer,
  clientData: ClientSurveyData,
  config: MatchingAlgorithmConfig
): { type: ExclusionType; reason: string } | null {
  // 1. Gender Mismatch Exclusion
  const genderExclusion = checkGenderExclusion(trainer, clientData);
  if (genderExclusion) return genderExclusion;

  // 2. Format Incompatibility Exclusion
  const formatExclusion = checkFormatExclusion(trainer, clientData);
  if (formatExclusion) return formatExclusion;

  // 3. Budget Hard Ceiling Exclusion
  const budgetExclusion = checkBudgetExclusion(trainer, clientData, config);
  if (budgetExclusion) return budgetExclusion;

  // 4. Availability Mismatch Exclusion
  const availabilityExclusion = checkAvailabilityExclusion(trainer, clientData);
  if (availabilityExclusion) return availabilityExclusion;

  return null;
}

function checkGenderExclusion(
  trainer: Trainer,
  clientData: ClientSurveyData
): { type: ExclusionType; reason: string } | null {
  const preference = clientData.trainer_gender_preference;
  
  // No preference or "no_preference" = no exclusion
  if (!preference || preference === 'no_preference') {
    return null;
  }

  const trainerGender = (trainer as any).gender as string | undefined;
  
  // If trainer has no gender specified, don't exclude
  if (!trainerGender) {
    return null;
  }

  // Check if trainer gender matches client preference
  if (trainerGender.toLowerCase() !== preference.toLowerCase()) {
    return {
      type: 'gender',
      reason: `Client prefers ${preference} trainer, trainer is ${trainerGender}`
    };
  }

  return null;
}

function checkFormatExclusion(
  trainer: Trainer,
  clientData: ClientSurveyData
): { type: ExclusionType; reason: string } | null {
  const preference = clientData.training_location_preference;
  
  // No preference or hybrid = no exclusion
  if (!preference || preference === 'hybrid') {
    return null;
  }

  const trainerFormats = (trainer as any).delivery_format || trainer.trainingType || [];
  
  if (!Array.isArray(trainerFormats) || trainerFormats.length === 0) {
    return null; // Can't determine, don't exclude
  }

  const formatsLower = trainerFormats.map((f: string) => f.toLowerCase());

  if (preference === 'in-person') {
    // Client needs in-person
    const hasInPerson = formatsLower.some((f: string) => 
      f.includes('person') || f.includes('gym') || f.includes('studio')
    );
    
    if (!hasInPerson && !clientData.open_to_virtual_coaching) {
      return {
        type: 'format',
        reason: 'Client requires in-person training, trainer only offers online'
      };
    }
  } else if (preference === 'online') {
    // Client needs online
    const hasOnline = formatsLower.some((f: string) => 
      f.includes('online') || f.includes('virtual') || f.includes('remote')
    );
    
    if (!hasOnline) {
      return {
        type: 'format',
        reason: 'Client requires online training, trainer only offers in-person'
      };
    }
  }

  return null;
}

function checkBudgetExclusion(
  trainer: Trainer,
  clientData: ClientSurveyData,
  config: MatchingAlgorithmConfig
): { type: ExclusionType; reason: string } | null {
  const clientMax = clientData.budget_range_max;
  
  // No max budget = no exclusion
  if (!clientMax) {
    return null;
  }

  // Get trainer's minimum price
  const packagePrices = trainer.package_options?.map((pkg: any) => pkg.price).filter(Boolean) || [];
  const trainerMinPrice = packagePrices.length > 0 
    ? Math.min(...packagePrices) 
    : trainer.hourlyRate;

  if (!trainerMinPrice) {
    return null; // Can't determine, don't exclude
  }

  // Calculate hard ceiling based on config
  const hardExclusionPercent = config.budget.hard_exclusion_percent || 40;
  const hardCeiling = clientMax * (1 + hardExclusionPercent / 100);

  // If trainer's minimum price exceeds hard ceiling, exclude
  if (trainerMinPrice > hardCeiling) {
    return {
      type: 'budget',
      reason: `Trainer's minimum rate ($${trainerMinPrice}) exceeds client's budget ceiling ($${Math.round(hardCeiling)})`
    };
  }

  return null;
}

function checkAvailabilityExclusion(
  trainer: Trainer,
  clientData: ClientSurveyData
): { type: ExclusionType; reason: string } | null {
  const timeline = clientData.start_timeline;
  
  // Only check for ASAP timeline
  if (timeline !== 'asap') {
    return null;
  }

  // Check if trainer is accepting new clients
  const acceptingNewClients = (trainer as any).accepting_new_clients;
  
  // If explicitly false, exclude
  if (acceptingNewClients === false) {
    return {
      type: 'availability',
      reason: 'Client needs to start ASAP, trainer is not accepting new clients'
    };
  }

  return null;
}

// Export the hard exclusion rules for display in admin panel
export const HARD_EXCLUSION_RULES = [
  {
    id: 'gender',
    name: 'Trainer Gender Mismatch',
    description: 'If client specifies "Male" or "Female" preference, trainers of other genders are excluded.',
    icon: 'User',
    configurable: false
  },
  {
    id: 'format',
    name: 'Training Format Incompatibility',
    description: 'If client requires in-person only and trainer only offers online (or vice versa), trainer is excluded.',
    icon: 'MapPin',
    configurable: false
  },
  {
    id: 'budget',
    name: 'Budget Hard Ceiling',
    description: 'If trainer\'s minimum price exceeds client\'s max budget by more than the configured threshold, trainer is excluded.',
    icon: 'DollarSign',
    configurable: true,
    configKey: 'budget.hard_exclusion_percent'
  },
  {
    id: 'availability',
    name: 'Availability Mismatch',
    description: 'If client timeline is "ASAP" and trainer is not accepting new clients, trainer is excluded.',
    icon: 'Clock',
    configurable: false
  }
] as const;
