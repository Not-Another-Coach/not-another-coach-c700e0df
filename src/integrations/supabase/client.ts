// This file uses centralized environment config - do not hardcode values here
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { ENV_CONFIG, getSupabaseAnonKey } from '@/config/environment';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  ENV_CONFIG.supabaseUrl,
  getSupabaseAnonKey(),
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
