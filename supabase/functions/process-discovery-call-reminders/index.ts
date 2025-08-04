import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Processing discovery call reminders...')

    const now = new Date()
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

    // Find calls that need 24-hour reminders
    const { data: callsFor24hReminder, error: error24h } = await supabase
      .from('discovery_calls')
      .select('id, scheduled_for')
      .eq('status', 'scheduled')
      .gte('scheduled_for', now.toISOString())
      .lte('scheduled_for', twentyFourHoursFromNow.toISOString())
      .is('reminder_24h_sent', null)

    if (error24h) {
      console.error('Error fetching 24h reminder calls:', error24h)
    } else if (callsFor24hReminder && callsFor24hReminder.length > 0) {
      console.log(`Found ${callsFor24hReminder.length} calls needing 24h reminders`)

      for (const call of callsFor24hReminder) {
        try {
          // Send 24-hour reminder
          const response = await supabase.functions.invoke('send-discovery-call-email', {
            body: {
              type: 'reminder',
              discoveryCallId: call.id,
              timeUntil: 'in 24 hours'
            }
          })

          if (response.error) {
            console.error(`Failed to send 24h reminder for call ${call.id}:`, response.error)
          } else {
            // Mark as sent
            await supabase
              .from('discovery_calls')
              .update({ reminder_24h_sent: now.toISOString() })
              .eq('id', call.id)

            console.log(`24h reminder sent for call ${call.id}`)
          }
        } catch (error) {
          console.error(`Error processing 24h reminder for call ${call.id}:`, error)
        }
      }
    }

    // Find calls that need 1-hour reminders
    const { data: callsFor1hReminder, error: error1h } = await supabase
      .from('discovery_calls')
      .select('id, scheduled_for')
      .eq('status', 'scheduled')
      .gte('scheduled_for', now.toISOString())
      .lte('scheduled_for', oneHourFromNow.toISOString())
      .is('reminder_1h_sent', null)

    if (error1h) {
      console.error('Error fetching 1h reminder calls:', error1h)
    } else if (callsFor1hReminder && callsFor1hReminder.length > 0) {
      console.log(`Found ${callsFor1hReminder.length} calls needing 1h reminders`)

      for (const call of callsFor1hReminder) {
        try {
          // Send 1-hour reminder
          const response = await supabase.functions.invoke('send-discovery-call-email', {
            body: {
              type: 'reminder',
              discoveryCallId: call.id,
              timeUntil: 'in 1 hour'
            }
          })

          if (response.error) {
            console.error(`Failed to send 1h reminder for call ${call.id}:`, response.error)
          } else {
            // Mark as sent
            await supabase
              .from('discovery_calls')
              .update({ reminder_1h_sent: now.toISOString() })
              .eq('id', call.id)

            console.log(`1h reminder sent for call ${call.id}`)
          }
        } catch (error) {
          console.error(`Error processing 1h reminder for call ${call.id}:`, error)
        }
      }
    }

    const totalProcessed = (callsFor24hReminder?.length || 0) + (callsFor1hReminder?.length || 0)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: totalProcessed,
        reminders24h: callsFor24hReminder?.length || 0,
        reminders1h: callsFor1hReminder?.length || 0,
        timestamp: now.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-discovery-call-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})