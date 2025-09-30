/**
 * Data Services
 * 
 * Centralized data access layer for the application
 */

export { ProfileService } from './ProfileService';
export { EngagementService } from './EngagementService';
export { TrainerService } from './TrainerService';

export type {
  EngagementData,
  ProspectSummary,
} from './EngagementService';

export type {
  TrainerSearchFilters,
  TrainerProfile,
} from './TrainerService';
