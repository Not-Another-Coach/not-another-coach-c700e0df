import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionActionRequest {
  action: 'cancel' | 'pause' | 'resume';
  subscription_id: string;
  reason?: string;
}

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

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { action, subscription_id, reason }: SubscriptionActionRequest = await req.json();

    let result;

    switch (action) {
      case 'cancel':
        // Cancel subscription at period end
        result = await stripe.subscriptions.update(subscription_id, {
          cancel_at_period_end: true,
          metadata: {
            cancellation_reason: reason || 'User requested',
            cancelled_by: user.id,
          }
        });

        // Update local database
        await supabase
          .from('trainer_membership')
          .update({ 
            status: 'cancelling',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription_id);

        console.log('Subscription scheduled for cancellation:', subscription_id);
        break;

      case 'pause':
        // Pause subscription
        result = await stripe.subscriptions.update(subscription_id, {
          pause_collection: {
            behavior: 'void',
          }
        });

        await supabase
          .from('trainer_membership')
          .update({ 
            status: 'paused',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription_id);

        console.log('Subscription paused:', subscription_id);
        break;

      case 'resume':
        // Resume subscription
        result = await stripe.subscriptions.update(subscription_id, {
          pause_collection: null,
          cancel_at_period_end: false,
        });

        await supabase
          .from('trainer_membership')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription_id);

        console.log('Subscription resumed:', subscription_id);
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify({ 
      success: true,
      subscription: result 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Subscription management error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to manage subscription' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
