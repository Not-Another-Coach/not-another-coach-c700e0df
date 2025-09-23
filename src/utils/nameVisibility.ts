import { EngagementStage, VisibilityState } from '@/hooks/useVisibilityMatrix';

export interface TrainerNameData {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string; // For backward compatibility
}

/**
 * Generates a consistent anonymous ID for a trainer
 * Format: Coach_XXXX where XXXX is based on trainer ID
 */
export function generateAnonymousId(trainerId: string): string {
  // Create a simple hash from the trainer ID to generate consistent numbers
  let hash = 0;
  for (let i = 0; i < trainerId.length; i++) {
    const char = trainerId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Ensure positive number and limit to 4 digits
  const id = Math.abs(hash) % 10000;
  return `Coach_${id.toString().padStart(4, '0')}`;
}

/**
 * Gets the appropriate name display based on engagement stage and visibility state
 */
export function getDisplayNameByEngagement(
  trainer: TrainerNameData,
  engagementStage: EngagementStage,
  visibilityState: VisibilityState
): string {
  const firstName = trainer.first_name || '';
  const lastName = trainer.last_name || '';
  const fullName = trainer.name || `${firstName} ${lastName}`.trim();

  // If visibility is completely hidden, show anonymous ID
  if (visibilityState === 'hidden') {
    return generateAnonymousId(trainer.id);
  }

  // If no names available, fallback to anonymous ID
  if (!firstName && !lastName && !fullName) {
    return generateAnonymousId(trainer.id);
  }

  // Progressive disclosure based on engagement stage
  switch (engagementStage) {
    case 'browsing':
      // Anonymous guests see anonymous ID
      return generateAnonymousId(trainer.id);
      
    case 'liked':
    case 'shortlisted':
      // Known users see first name only
      return firstName || fullName.split(' ')[0] || generateAnonymousId(trainer.id);
      
    case 'getting_to_know_your_coach':
    case 'discovery_in_progress':
    case 'discovery_completed':
      // Discovery stage sees first name + last initial
      if (firstName && lastName) {
        return `${firstName} ${lastName.charAt(0)}.`;
      }
      return firstName || fullName.split(' ')[0] || generateAnonymousId(trainer.id);
      
    case 'matched':
    case 'agreed':
    case 'payment_pending':
    case 'active_client':
      // Active clients see full name
      return fullName || `${firstName} ${lastName}`.trim() || generateAnonymousId(trainer.id);
      
    default:
      return generateAnonymousId(trainer.id);
  }
}

/**
 * Maps visibility state to engagement stage for name display
 */
export function mapVisibilityToEngagementStage(visibilityState: VisibilityState): EngagementStage {
  switch (visibilityState) {
    case 'hidden':
      return 'browsing';
    case 'blurred':
      return 'liked';
    case 'visible':
      return 'active_client';
    default:
      return 'browsing';
  }
}

/**
 * Legacy function for backward compatibility
 * Determines display name based on visibility state only
 */
export function getDisplayNameByVisibility(
  trainer: TrainerNameData,
  visibilityState: VisibilityState
): string {
  const mappedStage = mapVisibilityToEngagementStage(visibilityState);
  return getDisplayNameByEngagement(trainer, mappedStage, visibilityState);
}