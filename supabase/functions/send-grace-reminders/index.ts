import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const results = {
    reminders_sent: 0,
    errors: [] as string[]
  }

  try {
    // Find trainers with grace ending tomorrow who haven't been reminded
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    console.log(`Looking for grace periods ending on ${tomorrowStr}`)

    const { data: expiringGrace, error: fetchError } = await supabase
      .from('trainer_membership')
      .select(`
        trainer_id,
        grace_end_date,
        grace_reminder_sent_at
      `)
      .eq('payment_status', 'past_due')
      .eq('grace_end_date', tomorrowStr)
      .is('grace_reminder_sent_at', null)

    if (fetchError) throw fetchError

    console.log(`Found ${expiringGrace?.length || 0} trainers to remind`)

    for (const membership of expiringGrace || []) {
      try {
        // Create in-app alert
        const { error: alertError } = await supabase.from('alerts').insert({
          alert_type: 'payment_grace_ending',
          title: 'Grace Period Ends Tomorrow',
          content: `Your grace period expires on ${tomorrowStr}. Update your payment to avoid Limited mode.`,
          target_audience: { trainers: [membership.trainer_id] },
          metadata: {
            grace_end_date: tomorrowStr,
            reminder_type: '24_hour'
          },
          is_active: true,
          priority: 3
        })

        if (alertError) throw alertError

        // Update reminder timestamp
        const { error: updateError } = await supabase
          .from('trainer_membership')
          .update({ grace_reminder_sent_at: new Date().toISOString() })
          .eq('trainer_id', membership.trainer_id)

        if (updateError) throw updateError

        results.reminders_sent++
        console.log(`Reminder sent for trainer ${membership.trainer_id}`)
      } catch (err: any) {
        const errorMsg = `Reminder failed for ${membership.trainer_id}: ${err.message}`
        results.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    console.log(`Grace reminders complete: ${results.reminders_sent} sent, ${results.errors.length} errors`)

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    console.error('Error in send-grace-reminders:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
