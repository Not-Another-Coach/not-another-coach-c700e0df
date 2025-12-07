/**
 * Environment Configuration
 * 
 * SINGLE POINT OF CHANGE BETWEEN DEV AND PROD
 * 
 * When syncing between Lovable projects, ONLY change CURRENT_PROJECT_ID:
 * - Dev:  'zkzahqnsfjnvskfywbvg'
 * - Prod: 'ogpiovfxjxcclptfybrk'
 */

type ProjectId = 'zkzahqnsfjnvskfywbvg' | 'ogpiovfxjxcclptfybrk';

const DEV_PROJECT_ID = 'zkzahqnsfjnvskfywbvg';
const PROD_PROJECT_ID = 'ogpiovfxjxcclptfybrk';

// ============================================================
// CHANGE THIS VALUE WHEN SWITCHING ENVIRONMENTS
// ============================================================
const CURRENT_PROJECT_ID = DEV_PROJECT_ID as ProjectId;
// ============================================================

// Supabase anon keys per environment
const SUPABASE_ANON_KEYS: Record<ProjectId, string> = {
  'zkzahqnsfjnvskfywbvg': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpremFocW5zZmpudnNrZnl3YnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDM2NzAsImV4cCI6MjA4MDU3OTY3MH0.MdDuqQdFKXkZOqf0BuXQRFyWAI6ugrBmnqr2wMf31AY',
  'ogpiovfxjxcclptfybrk': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncGlvdmZ4anhjY2xwdGZ5YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTg3NzEsImV4cCI6MjA2OTczNDc3MX0.wWLacGgdAd3tNAKyyigwNK91hvxnP5l4qcPABTQGyqw',
};

export const ENV_CONFIG = {
  projectId: CURRENT_PROJECT_ID,
  supabaseUrl: `https://${CURRENT_PROJECT_ID}.supabase.co`,
  isDevEnvironment: CURRENT_PROJECT_ID === DEV_PROJECT_ID,
  isProductionEnvironment: CURRENT_PROJECT_ID === PROD_PROJECT_ID,
  supabaseDashboardUrl: `https://supabase.com/dashboard/project/${CURRENT_PROJECT_ID}`,
};

export const getSupabaseAnonKey = (): string => {
  return SUPABASE_ANON_KEYS[CURRENT_PROJECT_ID];
};

export const getSupabaseEdgeFunctionUrl = (functionName: string): string => {
  return `${ENV_CONFIG.supabaseUrl}/functions/v1/${functionName}`;
};
