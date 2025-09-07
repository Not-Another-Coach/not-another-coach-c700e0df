import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Starting get-user-emails function');
  
  try {
    // Set timeout for the entire operation (25 seconds to stay under CF limit)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), 25000);
    });

    const operationPromise = async () => {
      // Create admin client with timeout settings
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      console.log('Checking authorization...');
      
      // Get authorization header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('No authorization header');
      }

      // Verify user is authenticated
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError || !user) {
        throw new Error('Unauthorized');
      }

      console.log('Checking admin privileges...');

      // Check if user is admin
      const { data: userRoles, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !userRoles) {
        throw new Error('Admin privileges required');
      }

      console.log('Fetching users...');

      // Get users with pagination to avoid timeouts
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Limit to prevent timeout
      });

      if (error) {
        throw error;
      }

      console.log(`Found ${users.users.length} users`);

      // Return user emails (filter out null emails)
      const userEmails = users.users
        .filter(user => user.email) // Only include users with emails
        .map(user => ({
          user_id: user.id,
          email: user.email
        }));

      return userEmails;
    };

    // Race between operation and timeout
    const userEmails = await Promise.race([operationPromise(), timeoutPromise]);

    console.log('Returning user emails successfully');
    
    return new Response(JSON.stringify(userEmails), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in get-user-emails function:', error);
    
    // Return appropriate error status
    const status = error.message.includes('Unauthorized') || error.message.includes('Admin privileges') ? 403 : 500;
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);