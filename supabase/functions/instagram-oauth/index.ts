import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InstagramTokenResponse {
  access_token: string
  user_id: string
}

interface InstagramUserInfo {
  id: string
  username: string
  account_type: string
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

    // Handle OAuth callback from Instagram (GET request with code in URL params)
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')
      
      if (error) {
        return new Response(
          `<html><body><script>window.close();</script><p>Authorization cancelled</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      }
      
      if (!code) {
        return new Response(
          `<html><body><script>window.close();</script><p>No authorization code received</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      }
      
      // Store the code temporarily and redirect to success page
      return new Response(
        `<html><body><script>
          window.opener && window.opener.postMessage({ type: 'INSTAGRAM_AUTH_SUCCESS', code: '${code}' }, '*');
          window.close();
        </script><p>Authorization successful! You can close this window.</p></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

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

    const body = await req.json()
    const { action, code, redirect_uri } = body

    const appId = Deno.env.get('INSTAGRAM_APP_ID')
    const appSecret = Deno.env.get('INSTAGRAM_APP_SECRET')
    
    if (!appId || !appSecret) {
      throw new Error('Instagram API credentials not configured')
    }

    // Handle getting auth URL
    if (action === 'get_auth_url') {
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/instagram-oauth`
      const scopes = 'user_profile,user_media'
      
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`
      
      return new Response(
        JSON.stringify({ auth_url: authUrl }),
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      )
    }
    
    // Handle token exchange - code is required for this flow
    if (!code) {
      throw new Error('No authorization code provided')
    }

    console.log('Exchanging code for access token...')
    
    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri || `${Deno.env.get('SUPABASE_URL')}/functions/v1/instagram-oauth`,
      code: code
    })

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      throw new Error(`Token exchange failed: ${errorText}`)
    }

    const tokenData: InstagramTokenResponse = await tokenResponse.json()
    console.log('Token exchange successful, user_id:', tokenData.user_id)

    // Get user info from Instagram
    const userInfoResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${tokenData.access_token}`
    )

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch Instagram user info')
    }

    const userInfo: InstagramUserInfo = await userInfoResponse.json()
    console.log('User info fetched:', userInfo.username)

    // Store connection in database
    const { data: connection, error: dbError } = await supabase
      .from('instagram_connections')
      .upsert({
        trainer_id: user.id,
        instagram_user_id: userInfo.id,
        access_token: tokenData.access_token,
        instagram_username: userInfo.username,
        account_type: userInfo.account_type,
        is_active: true
      }, {
        onConflict: 'trainer_id'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log('Connection saved successfully')

    return new Response(
      JSON.stringify({
        success: true,
        connection: {
          id: connection.id,
          username: userInfo.username,
          account_type: userInfo.account_type
        }
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('Instagram OAuth error:', error)
    
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