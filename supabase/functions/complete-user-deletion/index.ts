import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteUserRequest {
  userId: string;
  confirmationPhrase: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Complete user deletion request received');

    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    // Parse request body
    const { userId, confirmationPhrase }: DeleteUserRequest = await req.json();

    // Validate required parameters
    if (!userId || !confirmationPhrase) {
      throw new Error('Missing required parameters: userId and confirmationPhrase');
    }

    // Validate confirmation phrase
    if (confirmationPhrase !== 'DELETE USER PERMANENTLY') {
      throw new Error('Invalid confirmation phrase. Type exactly: DELETE USER PERMANENTLY');
    }

    console.log(`Processing complete deletion for user: ${userId}`);

    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Regular client for database operations (inherits user permissions)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') ?? ''
        }
      }
    });

    // Admin client for auth operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Step 1: Call the comprehensive database cleanup function
    console.log('Step 1: Calling database cleanup function...');
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('admin_delete_user_completely', { p_user_id: userId });

    if (cleanupError) {
      console.error('Database cleanup error:', cleanupError);
      throw new Error(`Database cleanup failed: ${cleanupError.message}`);
    }

    console.log('Database cleanup completed:', {
      totalRecordsDeleted: cleanupResult.total_records_deleted,
      userEmail: cleanupResult.user_email,
      userType: cleanupResult.user_type
    });

    // Step 2: Delete from auth.users using admin client
    console.log('Step 2: Deleting from auth.users...');
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Auth deletion error:', authDeleteError);
      // Log this but don't fail the entire operation as database cleanup succeeded
      console.log('Warning: Auth deletion failed but database cleanup was successful');
    } else {
      console.log('Successfully deleted user from auth.users');
    }

    // Step 3: Final verification - check if user still exists
    const { data: userCheck } = await supabaseAdmin.auth.admin.getUserById(userId);
    const userStillExists = userCheck.user !== null;

    // Prepare response
    const response = {
      success: true,
      userId: userId,
      userEmail: cleanupResult.user_email,
      userType: cleanupResult.user_type,
      totalRecordsDeleted: cleanupResult.total_records_deleted,
      deletionCounts: cleanupResult.deletion_counts,
      authUserDeleted: !authDeleteError,
      authUserStillExists: userStillExists,
      deletedAt: cleanupResult.deleted_at,
      warning: authDeleteError ? 'Database cleanup completed but auth user deletion failed' : null
    };

    console.log('Complete user deletion finished:', {
      success: response.success,
      totalRecordsDeleted: response.totalRecordsDeleted,
      authUserDeleted: response.authUserDeleted,
      authUserStillExists: response.authUserStillExists
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Complete user deletion error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});