// Unified trainer types for the application
import { Trainer } from '@/components/TrainerCard';

export interface UnifiedTrainer {
  // Core identification
  id: string;
  name: string;
  
  // Profile information
  profilePhotoUrl?: string;
  image?: string; // Legacy field for backward compatibility
  bio?: string;
  tagline?: string;
  location?: string;
  
  // Professional details
  specializations?: string[];
  specialties?: string[]; // Legacy field for backward compatibility
  trainingType?: string[];
  training_types?: string[]; // Legacy field for backward compatibility
  qualifications?: string[];
  certifications?: string[]; // For Trainer compatibility
  deliveryFormat?: string[];
  delivery_format?: string[]; // Legacy field for backward compatibility
  
  // Ratings and reviews
  rating?: number;
  totalRatings?: number;
  total_ratings?: number; // Legacy field for backward compatibility
  reviews?: number; // Legacy field for backward compatibility
  
  // Pricing and availability
  hourlyRate?: number;
  hourly_rate?: number; // Legacy field for backward compatibility
  experience?: string;
  availability?: string; // For Trainer compatibility
  description?: string; // For Trainer compatibility
  offersDiscoveryCall?: boolean;
  freeDiscoveryCall?: boolean;
  free_discovery_call?: boolean; // Legacy field for backward compatibility
  
  // Engagement and status
  status?: string;
  isVerified?: boolean;
  is_verified?: boolean; // Legacy field for backward compatibility
  
  // Additional trainer-specific fields
  testimonials?: any[];
  galleryImages?: any[];
  profileSetupCompleted?: boolean;
  profile_setup_completed?: boolean; // Legacy field for backward compatibility
  
  // Ways of working and philosophy
  philosophy?: string;
  howStarted?: string;
  how_started?: string; // Legacy field for backward compatibility
  coachingStyle?: string[];
  coaching_style?: string[]; // Legacy field for backward compatibility  
  communicationStyle?: string[];
  communication_style?: string[]; // Legacy field for backward compatibility
  
  // Calendar and availability
  calendarLink?: string;
  calendar_link?: string; // Legacy field for backward compatibility
  availabilitySchedule?: any;
  availability_schedule?: any; // Legacy field for backward compatibility
  
  // Visibility and verification
  profilePublished?: boolean;
  profile_published?: boolean; // Legacy field for backward compatibility
  verificationStatus?: string;
  verification_status?: string; // Legacy field for backward compatibility
}

// Layout modes for trainer cards
export type TrainerCardLayout = 'full' | 'carousel' | 'grid' | 'compact';

// View modes for trainer card content - updated to support dynamic transformations
export type TrainerCardViewMode = 'instagram' | 'features' | 'transformations' | (string & {});

// Unified trainer type that works with both interfaces
export type AnyTrainer = Trainer | UnifiedTrainer;

// Unified trainer card props interface
export interface UnifiedTrainerCardProps {
  trainer: AnyTrainer;
  layout?: TrainerCardLayout;
  
  // Navigation and interaction
  onViewProfile?: (trainerId: string) => void;
  onMessage?: (trainerId: string) => void;
  
  // Match and comparison
  matchScore?: number;
  matchReasons?: string[];
  showComparisonCheckbox?: boolean;
  comparisonChecked?: boolean;
  onComparisonToggle?: (trainerId: string) => void;
  comparisonDisabled?: boolean;
  
  // State management
  cardState?: 'saved' | 'shortlisted' | 'discovery' | 'matched' | 'declined' | 'waitlist' | 'default';
  showRemoveButton?: boolean;
  onRemove?: (trainerId: string) => void;
  
  // Actions
  onAddToShortlist?: (trainerId: string) => void;
  onStartConversation?: (trainerId: string) => void;
  onBookDiscoveryCall?: (trainerId: string) => void;
  onEditDiscoveryCall?: (trainerId: string) => void;
  onProceedWithCoach?: (trainerId: string) => void;
  onRejectCoach?: (trainerId: string) => void;
  
  // Status flags
  isShortlisted?: boolean;
  hasDiscoveryCall?: boolean;
  discoveryCallData?: any;
  trainerOffersDiscoveryCalls?: boolean;
  waitlistRefreshKey?: number;
  
  // Management actions
  onMoveToSaved?: (trainerId: string) => void;
  onRemoveCompletely?: (trainerId: string) => void;
  
  // View control
  initialView?: TrainerCardViewMode;
  allowViewSwitching?: boolean;
  
  // Carousel-specific props
  showEngagementBadge?: boolean;
  compactActions?: boolean;
  hideViewControls?: boolean;
}

// Trainer card configuration for different contexts
export interface TrainerCardConfig {
  layout: TrainerCardLayout;
  allowViewSwitching: boolean;
  showEngagementBadge: boolean;
  compactActions: boolean;
  hideViewControls: boolean;
  availableViews?: TrainerCardViewMode[];
}

// Predefined configurations for different use cases
export const TRAINER_CARD_CONFIGS: Record<string, TrainerCardConfig> = {
  carousel: {
    layout: 'carousel',
    allowViewSwitching: true,
    showEngagementBadge: true,
    compactActions: true,
    hideViewControls: false,
    availableViews: ['instagram', 'features']
  },
  explore: {
    layout: 'full',
    allowViewSwitching: true,
    showEngagementBadge: false,
    compactActions: false,
    hideViewControls: false
  },
  comparison: {
    layout: 'grid',
    allowViewSwitching: false,
    showEngagementBadge: false,
    compactActions: true,
    hideViewControls: true,
    availableViews: ['features']
  },
  profile: {
    layout: 'full',
    allowViewSwitching: true,
    showEngagementBadge: false,
    compactActions: false,
    hideViewControls: false
  }
};