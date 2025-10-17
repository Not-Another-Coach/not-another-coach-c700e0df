import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateSubscriptionRequest {
  history_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const { history_id } = await req.json() as UpdateSubscriptionRequest;

    // 1. Fetch the history record
    const { data: history, error: historyError } = await supabaseClient
      .from('trainer_membership_history')
      .select('*')
      .eq('id', history_id)
      .single();

    if (historyError || !history) {
      throw new Error('History record not found');
    }

    // 2. Fetch the membership record
    const { data: membership, error: membershipError } = await supabaseClient
      .from('trainer_membership')
      .select('stripe_subscription_id')
      .eq('trainer_id', history.trainer_id)
      .eq('is_active', true)
      .single();

    if (membershipError || !membership?.stripe_subscription_id) {
      throw new Error('Active membership with Stripe subscription not found');
    }

    // 3. Fetch the new plan definition
    const { data: planDef, error: planError } = await supabaseClient
      .from('membership_plan_definitions')
      .select('stripe_price_id, monthly_price_cents')
      .eq('id', history.new_plan_definition_id)
      .single();

    if (planError || !planDef?.stripe_price_id) {
      throw new Error('Plan definition or Stripe price ID not found');
    }

    // 4. Determine proration behavior
    const isUpgrade = history.change_type === 'upgrade';
    const prorationBehavior = isUpgrade ? 'create_prorations' : 'none';

    // 5. Update Stripe subscription
    const subscription = await stripe.subscriptions.update(
      membership.stripe_subscription_id,
      {
        items: [
          {
            id: (await stripe.subscriptions.retrieve(membership.stripe_subscription_id)).items.data[0].id,
            price: planDef.stripe_price_id,
          },
        ],
        proration_behavior: prorationBehavior,
        billing_cycle_anchor: 'unchanged',
      }
    );

    console.log('✅ Stripe subscription updated:', subscription.id);

    // 6. Capture proration invoice if created (for upgrades)
    let prorationInvoiceId = null;
    let prorationAmount = 0;

    if (isUpgrade && subscription.latest_invoice) {
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
      if (invoice.amount_due > 0) {
        prorationInvoiceId = invoice.id;
        prorationAmount = invoice.amount_due;

        // Create billing_invoice record
        await supabaseClient.from('billing_invoice').insert({
          trainer_id: history.trainer_id,
          invoice_type: 'proration',
          amount_cents: prorationAmount,
          currency: 'GBP',
          status: invoice.status === 'paid' ? 'paid' : 'due',
          description: `Proration charge for plan upgrade`,
          download_url: invoice.invoice_pdf,
          created_at: new Date(invoice.created * 1000).toISOString(),
        });
      }
    }

    // 7. Update history record with confirmation
    await supabaseClient
      .from('trainer_membership_history')
      .update({
        stripe_confirmed: true,
        stripe_confirmation_data: {
          subscription_id: subscription.id,
          proration_invoice_id: prorationInvoiceId,
          proration_amount: prorationAmount,
          updated_at: new Date().toISOString(),
        },
      })
      .eq('id', history_id);

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: subscription.id,
        proration_invoice_id: prorationInvoiceId,
        proration_amount: prorationAmount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Stripe subscription update failed:', error);

    // Create high-priority alert for admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient.from('alerts').insert({
      alert_type: 'system_error',
      title: 'Stripe Subscription Update Failed',
      content: `Failed to update Stripe subscription: ${error.message}`,
      target_audience: { admins: ['all'] },
      priority: 5,
      is_active: true,
      metadata: {
        error: error.message,
        function: 'update-stripe-subscription',
      },
    });

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
