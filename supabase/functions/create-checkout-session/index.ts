import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutSessionRequest {
  payment_type: 'trainer_membership' | 'coach_selection' | 'plan_upgrade';
  package_id?: string;
  trainer_id?: string;
  plan_type?: string;
  history_id?: string;
  proration_amount_cents?: number;
  new_plan_name?: string;
  success_url: string;
  cancel_url: string;
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

    const requestData: CheckoutSessionRequest = await req.json();
    const { payment_type, package_id, trainer_id, plan_type, history_id, proration_amount_cents, new_plan_name, success_url, cancel_url } = requestData;

    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (payment_type === 'trainer_membership') {
      // Trainer membership subscription
      const priceId = plan_type === 'high' 
        ? Deno.env.get('STRIPE_HIGH_PLAN_PRICE_ID')
        : Deno.env.get('STRIPE_LOW_PLAN_PRICE_ID');

      if (!priceId) {
        throw new Error('Stripe price ID not configured');
      }

      sessionParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        success_url,
        cancel_url,
        customer_email: user.email,
        metadata: {
          user_id: user.id,
          payment_type: 'trainer_membership',
          plan_type: plan_type || 'low',
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan_type: plan_type || 'low',
          }
        }
      };
    } else if (payment_type === 'coach_selection') {
      // Coach selection package payment
      if (!package_id) {
        throw new Error('Package ID is required for coach selection payment');
      }

      // Fetch package details
      const { data: packageData, error: packageError } = await supabase
        .from('payment_packages')
        .select('*, coach_selection_requests(*)')
        .eq('id', package_id)
        .single();

      if (packageError || !packageData) {
        throw new Error('Package not found');
      }

      const isSubscription = packageData.customer_payment_modes?.includes('installments') && 
                            packageData.installment_count && 
                            packageData.installment_count > 1;

      if (isSubscription) {
        // Create subscription for installment payments
        // First, create a price for this specific package
        const price = await stripe.prices.create({
          unit_amount: Math.round((packageData.price_value / packageData.installment_count) * 100),
          currency: packageData.price_currency.toLowerCase(),
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          product_data: {
            name: packageData.name,
            description: `Installment payment for ${packageData.name}`,
          },
          metadata: {
            package_id: package_id,
            installment_count: packageData.installment_count.toString(),
          }
        });

        sessionParams = {
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{
            price: price.id,
            quantity: 1,
          }],
          success_url,
          cancel_url,
          customer_email: user.email,
          metadata: {
            user_id: user.id,
            payment_type: 'coach_selection',
            package_id,
            trainer_id: packageData.trainer_id,
            payment_mode: 'installments',
            installment_count: packageData.installment_count.toString(),
          },
          subscription_data: {
            metadata: {
              package_id,
              installment_count: packageData.installment_count.toString(),
            },
            trial_settings: undefined,
          }
        };
      } else {
        // One-time payment
        sessionParams = {
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: packageData.price_currency.toLowerCase(),
              product_data: {
                name: packageData.name,
                description: `Training package with ${packageData.trainer_id}`,
              },
              unit_amount: Math.round(packageData.price_value * 100),
            },
            quantity: 1,
          }],
          success_url,
          cancel_url,
          customer_email: user.email,
          metadata: {
            user_id: user.id,
            payment_type: 'coach_selection',
            package_id,
            trainer_id: packageData.trainer_id,
            payment_mode: 'upfront',
          },
        };
      }
    } else if (payment_type === 'plan_upgrade') {
      // Plan upgrade - one-time prorated payment
      if (!history_id || proration_amount_cents === null || proration_amount_cents === undefined || !new_plan_name) {
        throw new Error('history_id, proration_amount_cents, and new_plan_name are required for plan upgrade');
      }

      sessionParams = {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Upgrade to ${new_plan_name}`,
              description: `Prorated upgrade charge`,
            },
            unit_amount: proration_amount_cents,
          },
          quantity: 1,
        }],
        success_url,
        cancel_url,
        customer_email: user.email,
        metadata: {
          user_id: user.id,
          payment_type: 'plan_upgrade',
          history_id,
        },
      };
    } else {
      throw new Error('Invalid payment type');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('Checkout session created:', session.id);

    return new Response(JSON.stringify({ 
      sessionId: session.id,
      url: session.url 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create checkout session' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
