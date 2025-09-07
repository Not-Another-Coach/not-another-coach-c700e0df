export enum ClientJourneyStage {
  DISCOVERY = 'discovery',
  SAVED = 'saved', 
  SHORTLISTED = 'shortlisted',
  WAITLIST = 'waitlist',
  CHOSEN = 'chosen'
}

export interface JourneyStageCounts {
  discovery: number;
  saved: number;
  shortlisted: number;
  waitlist: number;
  chosen: number;
}

export interface JourneyStageConfig {
  id: ClientJourneyStage;
  title: string;
  description: string;
  color: string;
  count: number;
}

export type ViewMode = 'funnel' | 'kanban';

// Map engagement stages to journey stages
export const ENGAGEMENT_TO_JOURNEY_MAPPING = {
  'browsing': ClientJourneyStage.DISCOVERY,
  'liked': ClientJourneyStage.SAVED,
  'saved': ClientJourneyStage.SAVED,
  'shortlisted': ClientJourneyStage.SHORTLISTED,
  'discovery_in_progress': ClientJourneyStage.SHORTLISTED,
  'discovery_completed': ClientJourneyStage.SHORTLISTED,
  'waitlist': ClientJourneyStage.WAITLIST,
  'agreed': ClientJourneyStage.WAITLIST,
  'payment_pending': ClientJourneyStage.WAITLIST,
  'active_client': ClientJourneyStage.CHOSEN,
  'chosen': ClientJourneyStage.CHOSEN,
  'declined': ClientJourneyStage.DISCOVERY,
  'declined_dismissed': ClientJourneyStage.DISCOVERY
} as const;

export interface TrainerWithJourneyStage {
  id: string;
  name: string;
  location: string;
  engagement_stage: string;
  journey_stage: ClientJourneyStage;
  [key: string]: any;
}