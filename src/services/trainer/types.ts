/**
 * Trainer Types
 */

import type { BaseProfile, ProfileStatus } from '../profile/types';

export interface TrainerProfile extends BaseProfile {
  bio?: string;
  tagline?: string;
  years_of_experience?: number;
  hourly_rate?: number;
  free_discovery_call: boolean;
  specializations: string[];
  qualifications: string[];
  coaching_style?: string;
  instagram_handle?: string;
  instagram_connected: boolean;
  instagram_posts?: InstagramPost[];
  availability?: TrainerAvailability;
  rating?: number;
  total_ratings?: number;
  profile_status: ProfileStatus;
  publication_requested_at?: string;
  published_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  testimonials?: Testimonial[];
}

export interface InstagramPost {
  id: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  caption?: string;
  permalink?: string;
  timestamp: string;
}

export interface TrainerAvailability {
  timezone: string;
  schedule: WeeklySchedule;
  exceptions?: AvailabilityException[];
}

export interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  available: boolean;
  slots?: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface AvailabilityException {
  date: string;
  available: boolean;
  reason?: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_photo_url?: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface TrainerSearchFilters {
  specializations?: string[];
  coaching_style?: string;
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  location?: string;
  min_rating?: number;
  free_discovery_call?: boolean;
}

export interface TrainerListItem {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  tagline?: string;
  location?: string;
  specializations: string[];
  rating?: number;
  total_ratings?: number;
  hourly_rate?: number;
  free_discovery_call: boolean;
}

export interface TrainerProfileUpdate {
  bio?: string;
  tagline?: string;
  years_of_experience?: number;
  hourly_rate?: number;
  free_discovery_call?: boolean;
  specializations?: string[];
  qualifications?: string[];
  coaching_style?: string;
  instagram_handle?: string;
  availability?: TrainerAvailability;
}
