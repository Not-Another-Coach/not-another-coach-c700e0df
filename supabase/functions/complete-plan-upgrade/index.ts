import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error('session_id is required');
    }

    console.log('Processing plan upgrade completion for session:', session_id);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    const { history_id, user_id, payment_type } = session.metadata || {};

    if (payment_type !== 'plan_upgrade' || !history_id || !user_id) {
      throw new Error('Invalid session metadata');
    }

    console.log('Completing upgrade for history_id:', history_id, 'user_id:', user_id);

    // Get the history record
    const { data: historyRecord, error: historyError } = await supabase
      .from('trainer_membership_history')
      .select('*, to_plan:to_plan_id(display_name, monthly_price_cents)')
      .eq('id', history_id)
      .single();

    if (historyError || !historyRecord) {
      console.error('History record error:', historyError);
      throw new Error('History record not found');
    }

    // Update trainer_membership with new plan
    const { error: membershipError } = await supabase
      .from('trainer_membership')
      .update({
        plan_definition_id: historyRecord.to_plan_id,
        monthly_price_cents: historyRecord.to_plan.monthly_price_cents,
        updated_at: new Date().toISOString(),
      })
      .eq('trainer_id', user_id)
      .eq('is_active', true);

    if (membershipError) {
      console.error('Membership update error:', membershipError);
      throw new Error('Failed to update membership');
    }

    // Update history record with payment details
    const { error: historyUpdateError } = await supabase
      .from('trainer_membership_history')
      .update({
        payment_status: 'completed',
        stripe_checkout_session_id: session_id,
        stripe_payment_intent_id: session.payment_intent as string,
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', history_id);

    if (historyUpdateError) {
      console.error('History update error:', historyUpdateError);
      throw new Error('Failed to update history record');
    }

    // Create success alert for trainer
    const { error: alertError } = await supabase
      .from('alerts')
      .insert({
        alert_type: 'plan_upgraded',
        title: 'Plan Upgraded Successfully',
        content: `Your plan has been upgraded to ${historyRecord.to_plan.display_name}. Payment of £${(historyRecord.prorated_amount_cents / 100).toFixed(2)} processed successfully.`,
        target_audience: { trainers: [user_id] },
        metadata: {
          history_id,
          new_plan: historyRecord.to_plan.display_name,
          proration_cents: historyRecord.prorated_amount_cents,
          payment_intent_id: session.payment_intent,
        },
        is_active: true,
      });

    if (alertError) {
      console.error('Alert creation error:', alertError);
      // Don't throw - alert is non-critical
    }

    // Create invoice record for audit trail
    const { error: invoiceError } = await supabase
      .from('billing_invoice')
      .insert({
        trainer_id: user_id,
        invoice_type: 'plan_upgrade',
        description: `Plan upgrade to ${historyRecord.to_plan.display_name}`,
        amount_cents: historyRecord.prorated_amount_cents,
        currency: 'GBP',
        status: 'paid',
        created_at: new Date().toISOString(),
      });

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError);
      // Don't throw - invoice is non-critical
    }

    console.log('Plan upgrade completed successfully for user:', user_id);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Plan upgrade completed successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Plan upgrade completion error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to complete plan upgrade' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
