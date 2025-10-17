import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const authHeader = req.headers.get('Authorization')
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )

    if (authError || !user) throw new Error('Unauthorized')

    // Check admin role
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    })

    if (!isAdmin) throw new Error('Admin access required')

    const { trainer_id } = await req.json()

    console.log(`Admin ${user.id} retrying payment for trainer ${trainer_id}`)

    // Get trainer's membership with Stripe subscription
    const { data: membership, error: membershipError } = await supabase
      .from('trainer_membership')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('trainer_id', trainer_id)
      .eq('is_active', true)
      .single()

    if (membershipError) throw membershipError
    if (!membership?.stripe_subscription_id) throw new Error('No active Stripe subscription found')

    // Get latest invoice for the subscription
    const invoices = await stripe.invoices.list({
      subscription: membership.stripe_subscription_id,
      limit: 1,
      status: 'open'
    })

    if (!invoices.data.length) throw new Error('No open invoice found')

    const invoice = invoices.data[0]

    // Retry payment
    const result = await stripe.invoices.pay(invoice.id)

    // Log admin action
    await supabase.from('admin_actions_log').insert({
      admin_id: user.id,
      target_user_id: trainer_id,
      action_type: 'manual_payment_retry',
      action_details: { 
        invoice_id: invoice.id,
        amount: invoice.amount_due,
        payment_status: result.status
      },
      reason: 'Admin-initiated payment retry'
    })

    console.log(`Payment retry ${result.status} for trainer ${trainer_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_status: result.status,
        invoice_id: invoice.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Payment retry error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
