import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const results = {
    scheduled_downgrades_applied: 0,
    grace_periods_expired: 0,
    errors: [] as string[]
  }

  try {
    // 1. Apply scheduled downgrades
    const { data: scheduledChanges } = await supabase
      .from('trainer_membership_history')
      .select('*')
      .eq('change_type', 'downgrade')
      .lte('effective_date', new Date().toISOString().split('T')[0])
      .is('applied_at', null)

    for (const change of scheduledChanges || []) {
      try {
        const { data: newPlan } = await supabase
          .from('membership_plan_definitions')
          .select('plan_type, monthly_price_cents')
          .eq('id', change.to_plan_id)
          .single()

        if (newPlan) {
          await supabase
            .from('trainer_membership')
            .update({
              plan_type: newPlan.plan_type,
              monthly_price_cents: newPlan.monthly_price_cents,
              updated_at: new Date().toISOString()
            })
            .eq('trainer_id', change.trainer_id)
            .eq('is_active', true)

          await supabase
            .from('trainer_membership_history')
            .update({ applied_at: new Date().toISOString() })
            .eq('id', change.id)

          results.scheduled_downgrades_applied++
        }
      } catch (err: any) {
        results.errors.push(`Downgrade failed for ${change.id}: ${err.message}`)
      }
    }

    // 2. Check grace periods and activate Limited mode
    const { data: config } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'failed_payment_config')
      .single()

    const { data: expiredGrace } = await supabase
      .from('trainer_membership')
      .select('trainer_id, grace_end_date')
      .eq('payment_status', 'past_due')
      .lte('grace_end_date', new Date().toISOString().split('T')[0])

    for (const membership of expiredGrace || []) {
      try {
        await supabase
          .from('trainer_membership')
          .update({
            payment_status: 'limited_mode',
            limited_mode_activated_at: new Date().toISOString()
          })
          .eq('trainer_id', membership.trainer_id)
          .eq('is_active', true)

        // Hide from search if configured
        if (config?.setting_value?.hide_in_search_when_limited) {
          await supabase
            .from('profiles')
            .update({ profile_published: false })
            .eq('id', membership.trainer_id)
        }

        // Create alert
        await supabase.from('alerts').insert({
          alert_type: 'limited_mode_activated',
          title: 'Account in Limited Mode',
          content: 'Your grace period has expired. Your account is now in Limited mode. Please update your payment method to restore full access.',
          target_audience: { trainers: [membership.trainer_id] },
          metadata: {
            grace_expired_date: membership.grace_end_date
          },
          is_active: true,
          priority: 3
        })

        results.grace_periods_expired++
      } catch (err: any) {
        results.errors.push(`Limited mode activation failed for ${membership.trainer_id}: ${err.message}`)
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    console.error('Error in process-plan-changes:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
