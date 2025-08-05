import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkUserData {
  email: string;
  password: string;
  user_type: 'client' | 'trainer';
  first_name: string;
  last_name: string;
  // Client-specific fields
  primary_goals?: string[];
  secondary_goals?: string[];
  training_location_preference?: 'in-person' | 'online' | 'hybrid';
  open_to_virtual_coaching?: boolean;
  preferred_training_frequency?: number;
  preferred_time_slots?: string[];
  start_timeline?: 'urgent' | 'next_month' | 'flexible';
  preferred_coaching_style?: string[];
  motivation_factors?: string[];
  client_personality_type?: string[];
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  preferred_package_type?: 'ongoing' | 'short_term' | 'single_session';
  budget_range_min?: number;
  budget_range_max?: number;
  budget_flexibility?: 'strict' | 'flexible' | 'negotiable';
  waitlist_preference?: 'asap' | 'quality_over_speed';
  flexible_scheduling?: boolean;
  // Trainer-specific fields
  bio?: string;
  tagline?: string;
  location?: string;
  training_types?: string[];
  specializations?: string[];
  qualifications?: string[];
  ideal_client_types?: string[];
  coaching_styles?: string[];
  hourly_rate?: number;
  years_certified?: number;
  training_vibe?: string;
  communication_style?: string;
  delivery_format?: string[];
  max_clients?: number;
  packages?: Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    description?: string;
    sessions?: number;
    includes?: string[];
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { users } = await req.json() as { users: BulkUserData[] };

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error("No users provided or invalid format");
    }

    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const userData of users) {
      try {
        console.log(`Creating user: ${userData.email}`);

        // Create auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            user_type: userData.user_type,
            first_name: userData.first_name,
            last_name: userData.last_name
          }
        });

        if (authError) {
          throw new Error(`Auth creation failed: ${authError.message}`);
        }

        if (!authUser.user) {
          throw new Error("User creation returned no user data");
        }

        // Prepare profile data
        const profileData: any = {
          id: authUser.user.id,
          user_type: userData.user_type,
          first_name: userData.first_name,
          last_name: userData.last_name,
        };

        // Add client-specific data
        if (userData.user_type === 'client') {
          Object.assign(profileData, {
            primary_goals: userData.primary_goals || [],
            secondary_goals: userData.secondary_goals || [],
            training_location_preference: userData.training_location_preference || 'hybrid',
            open_to_virtual_coaching: userData.open_to_virtual_coaching ?? true,
            preferred_training_frequency: userData.preferred_training_frequency,
            preferred_time_slots: userData.preferred_time_slots || [],
            start_timeline: userData.start_timeline || 'flexible',
            preferred_coaching_style: userData.preferred_coaching_style || [],
            motivation_factors: userData.motivation_factors || [],
            client_personality_type: userData.client_personality_type || [],
            experience_level: userData.experience_level || 'beginner',
            preferred_package_type: userData.preferred_package_type || 'ongoing',
            budget_range_min: userData.budget_range_min,
            budget_range_max: userData.budget_range_max,
            budget_flexibility: userData.budget_flexibility || 'flexible',
            waitlist_preference: userData.waitlist_preference || 'quality_over_speed',
            flexible_scheduling: userData.flexible_scheduling ?? true,
            client_survey_completed: true,
            quiz_completed: true,
            client_survey_step: 8,
            total_client_survey_steps: 8
          });
        }

        // Add trainer-specific data
        if (userData.user_type === 'trainer') {
          Object.assign(profileData, {
            bio: userData.bio,
            tagline: userData.tagline,
            location: userData.location,
            training_types: userData.training_types || [],
            specializations: userData.specializations || [],
            qualifications: userData.qualifications || [],
            ideal_client_types: userData.ideal_client_types || [],
            coaching_styles: userData.coaching_styles || [],
            hourly_rate: userData.hourly_rate,
            year_certified: userData.years_certified,
            training_vibe: userData.training_vibe,
            communication_style: userData.communication_style,
            max_clients: userData.max_clients,
            package_options: userData.packages || [],
            profile_setup_completed: true,
            profile_published: true,
            verification_status: 'verified',
            terms_agreed: true,
            profile_setup_step: 10,
            total_profile_setup_steps: 10
          });
        }

        // Insert/update profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' });

        if (profileError) {
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        results.push({
          email: userData.email,
          user_id: authUser.user.id,
          status: 'success',
          user_type: userData.user_type
        });

        successCount++;
        console.log(`✅ Successfully created user: ${userData.email}`);

      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error);
        results.push({
          email: userData.email,
          status: 'error',
          error: error.message,
          user_type: userData.user_type
        });
        errorCount++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total: users.length,
        successful: successCount,
        failed: errorCount
      },
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Bulk user creation error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});