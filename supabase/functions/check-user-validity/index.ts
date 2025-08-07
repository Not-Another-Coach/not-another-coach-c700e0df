import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserValidityRequest {
  email: string;
}

interface UserValidityResponse {
  isValid: boolean;
  userExists: boolean;
  hasProfile: boolean;
  userType?: string;
  accountStatus?: string;
  lastLogin?: string;
  emailVerified?: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the request is from an authenticated admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the user making the request is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: user, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if the requesting user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.user.id)
      .single();

    if (!profile || profile.user_type !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { email }: UserValidityRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Checking validity for user: ${email}`);

    // Check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to check user in auth system' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const authUser = authUsers.users.find(u => u.email === email);
    
    let response: UserValidityResponse = {
      isValid: false,
      userExists: !!authUser,
      hasProfile: false
    };

    if (authUser) {
      console.log(`Found auth user: ${authUser.id}`);
      
      // Check if user has a profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, account_status, last_login_at')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.log('No profile found for user:', profileError);
      }

      response = {
        isValid: true,
        userExists: true,
        hasProfile: !!profileData,
        userType: profileData?.user_type,
        accountStatus: profileData?.account_status || 'active',
        lastLogin: profileData?.last_login_at,
        emailVerified: authUser.email_confirmed_at !== null
      };

      console.log('User validity check completed:', response);
    } else {
      console.log(`No auth user found for email: ${email}`);
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in check-user-validity function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});