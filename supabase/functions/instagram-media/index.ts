import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InstagramMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string
  permalink: string
  caption?: string
  timestamp: string
}

interface MediaResponse {
  data: InstagramMedia[]
  paging?: {
    cursors?: {
      before: string
      after: string
    }
    next?: string
  }
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

    console.log('Fetching media for user:', connection.username)

    // Fetch media from Instagram
    const mediaFields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp'
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=${mediaFields}&limit=25&access_token=${connection.access_token}`
    )

    if (!mediaResponse.ok) {
      const errorText = await mediaResponse.text()
      console.error('Media fetch failed:', errorText)
      
      // Handle token expiration
      if (mediaResponse.status === 401 || mediaResponse.status === 400) {
        // Mark connection as inactive
        await supabase
          .from('instagram_connections')
          .update({ is_active: false })
          .eq('id', connection.id)
        
        throw new Error('Instagram access token expired. Please reconnect your account.')
      }
      
      throw new Error(`Failed to fetch Instagram media: ${errorText}`)
    }

    const mediaData: MediaResponse = await mediaResponse.json()
    console.log(`Fetched ${mediaData.data?.length || 0} media items`)

    // Update last synced timestamp
    await supabase
      .from('instagram_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connection.id)

    // Get currently selected media for this trainer
    const { data: selectedMedia } = await supabase
      .from('instagram_selected_media')
      .select('instagram_media_id')
      .eq('trainer_id', user.id)
      .eq('is_active', true)

    const selectedMediaIds = selectedMedia?.map(m => m.instagram_media_id) || []

    // Format media data with selection status
    const formattedMedia = mediaData.data?.map(media => ({
      ...media,
      selected: selectedMediaIds.includes(media.id)
    })) || []

    return new Response(
      JSON.stringify({
        success: true,
        media: formattedMedia,
        connection: {
          username: connection.username,
          account_type: connection.account_type
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
    console.error('Instagram media fetch error:', error)
    
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