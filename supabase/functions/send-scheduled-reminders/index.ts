import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));

    console.log('🔔 Checking for discovery calls needing reminders...');
    console.log('Now:', now.toISOString());
    console.log('24h window:', twentyFourHoursFromNow.toISOString());
    console.log('1h window:', oneHourFromNow.toISOString());

    // Find calls needing 24-hour reminders
    const { data: calls24h, error: error24h } = await supabase
      .from('discovery_calls')
      .select('*')
      .in('status', ['scheduled', 'rescheduled'])
      .is('reminder_24h_sent', null)
      .gte('scheduled_for', now.toISOString())
      .lte('scheduled_for', twentyFourHoursFromNow.toISOString());

    if (error24h) {
      console.error('Error fetching 24h reminder calls:', error24h);
    } else if (calls24h && calls24h.length > 0) {
      console.log(`Found ${calls24h.length} calls needing 24h reminders`);
      
      for (const call of calls24h) {
        try {
          console.log(`Sending 24h reminder for call ${call.id}`);
          
          // Send 24-hour reminder email
          const { error: emailError } = await supabase.functions.invoke('send-discovery-call-email', {
            body: {
              type: 'reminder',
              discoveryCallId: call.id,
              reminderType: '24h'
            }
          });

          if (emailError) {
            console.error(`Error sending 24h reminder email for call ${call.id}:`, emailError);
            continue;
          }

          // Update reminder flag
          const { error: updateError } = await supabase
            .from('discovery_calls')
            .update({ reminder_24h_sent: now.toISOString() })
            .eq('id', call.id);

          if (updateError) {
            console.error(`Error updating 24h reminder flag for call ${call.id}:`, updateError);
          } else {
            console.log(`✅ Successfully sent 24h reminder for call ${call.id}`);
          }
        } catch (err) {
          console.error(`Error processing 24h reminder for call ${call.id}:`, err);
        }
      }
    } else {
      console.log('No calls needing 24h reminders');
    }

    // Find calls needing 1-hour reminders
    const { data: calls1h, error: error1h } = await supabase
      .from('discovery_calls')
      .select('*')
      .in('status', ['scheduled', 'rescheduled'])
      .is('reminder_1h_sent', null)
      .gte('scheduled_for', now.toISOString())
      .lte('scheduled_for', oneHourFromNow.toISOString());

    if (error1h) {
      console.error('Error fetching 1h reminder calls:', error1h);
    } else if (calls1h && calls1h.length > 0) {
      console.log(`Found ${calls1h.length} calls needing 1h reminders`);
      
      for (const call of calls1h) {
        try {
          console.log(`Sending 1h reminder for call ${call.id}`);
          
          // Send 1-hour reminder email
          const { error: emailError } = await supabase.functions.invoke('send-discovery-call-email', {
            body: {
              type: 'reminder',
              discoveryCallId: call.id,
              reminderType: '1h'
            }
          });

          if (emailError) {
            console.error(`Error sending 1h reminder email for call ${call.id}:`, emailError);
            continue;
          }

          // Update reminder flag
          const { error: updateError } = await supabase
            .from('discovery_calls')
            .update({ reminder_1h_sent: now.toISOString() })
            .eq('id', call.id);

          if (updateError) {
            console.error(`Error updating 1h reminder flag for call ${call.id}:`, updateError);
          } else {
            console.log(`✅ Successfully sent 1h reminder for call ${call.id}`);
          }
        } catch (err) {
          console.error(`Error processing 1h reminder for call ${call.id}:`, err);
        }
      }
    } else {
      console.log('No calls needing 1h reminders');
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent: {
          twentyFourHour: calls24h?.length || 0,
          oneHour: calls1h?.length || 0
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-scheduled-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});