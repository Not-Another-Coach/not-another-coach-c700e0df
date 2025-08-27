const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('Test Instagram function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const appId = Deno.env.get('INSTAGRAM_APP_ID')
    const appSecret = Deno.env.get('INSTAGRAM_APP_SECRET')
    
    console.log('Environment check:', {
      appId: appId ? `${appId.substring(0, 4)}...` : 'missing',
      appSecret: appSecret ? 'present' : 'missing',
      supabaseUrl: Deno.env.get('SUPABASE_URL') ? 'present' : 'missing'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test function working',
        hasAppId: !!appId,
        hasAppSecret: !!appSecret,
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL')
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  } catch (error) {
    console.error('Test error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})