import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenRefreshResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get trainer's Instagram connection
    const { data: connection, error: connectionError } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('trainer_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (connectionError) {
      throw new Error(`Database error: ${connectionError.message}`)
    }

    if (!connection) {
      throw new Error('No active Instagram connection found')
    }

    console.log('Refreshing token for user:', connection.username)

    // Refresh the access token
    const refreshResponse = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${connection.access_token}`,
      {
        method: 'GET'
      }
    )

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text()
      console.error('Token refresh failed:', errorText)
      
      // If token refresh fails, mark connection as inactive
      await supabase
        .from('instagram_connections')
        .update({ is_active: false })
        .eq('id', connection.id)
      
      throw new Error('Instagram token refresh failed. Please reconnect your account.')
    }

    const refreshData: TokenRefreshResponse = await refreshResponse.json()
    console.log('Token refreshed successfully')

    // Calculate new expiration date (Instagram tokens last 60 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (refreshData.expires_in ? Math.floor(refreshData.expires_in / 86400) : 60))

    // Update the connection with new token
    const { error: updateError } = await supabase
      .from('instagram_connections')
      .update({
        access_token: refreshData.access_token,
        token_expires_at: expiresAt.toISOString(),
        last_synced_at: new Date().toISOString()
      })
      .eq('id', connection.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      throw new Error(`Failed to update token: ${updateError.message}`)
    }

    console.log('Token updated successfully in database')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token refreshed successfully',
        expires_at: expiresAt.toISOString()
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('Instagram token refresh error:', error)
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})