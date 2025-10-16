import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentMethodRequest {
  action: 'create_setup_intent' | 'attach' | 'detach' | 'set_default';
  payment_method_id?: string;
  customer_id?: string;
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

    const { action, payment_method_id, customer_id }: PaymentMethodRequest = await req.json();

    let result;

    switch (action) {
      case 'create_setup_intent':
        // Create setup intent for adding new payment method
        let customerId = customer_id;

        if (!customerId) {
          // Create or retrieve Stripe customer
          const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id, email')
            .eq('id', user.id)
            .single();

          if (profile?.stripe_customer_id) {
            customerId = profile.stripe_customer_id;
          } else {
            const customer = await stripe.customers.create({
              email: profile?.email || user.email,
              metadata: {
                user_id: user.id,
              }
            });
            customerId = customer.id;

            // Save customer ID
            await supabase
              .from('profiles')
              .update({ stripe_customer_id: customerId })
              .eq('id', user.id);
          }
        }

        const setupIntent = await stripe.setupIntents.create({
          customer: customerId,
          payment_method_types: ['card'],
        });

        result = { 
          client_secret: setupIntent.client_secret,
          customer_id: customerId 
        };
        console.log('Setup intent created for user:', user.id);
        break;

      case 'attach':
        if (!payment_method_id || !customer_id) {
          throw new Error('Payment method ID and customer ID required');
        }

        // Attach payment method to customer
        await stripe.paymentMethods.attach(payment_method_id, {
          customer: customer_id,
        });

        // Get payment method details
        const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);

        // Save to database
        await supabase
          .from('billing_payment_method')
          .insert({
            trainer_id: user.id,
            stripe_payment_method_id: payment_method_id,
            method_type: paymentMethod.type,
            brand: paymentMethod.card?.brand,
            last4: paymentMethod.card?.last4,
            exp_month: paymentMethod.card?.exp_month,
            exp_year: paymentMethod.card?.exp_year,
            is_default: false,
            is_active: true,
          });

        result = { success: true, payment_method: paymentMethod };
        console.log('Payment method attached:', payment_method_id);
        break;

      case 'detach':
        if (!payment_method_id) {
          throw new Error('Payment method ID required');
        }

        // Detach payment method
        await stripe.paymentMethods.detach(payment_method_id);

        // Update database
        await supabase
          .from('billing_payment_method')
          .update({ is_active: false })
          .eq('stripe_payment_method_id', payment_method_id)
          .eq('trainer_id', user.id);

        result = { success: true };
        console.log('Payment method detached:', payment_method_id);
        break;

      case 'set_default':
        if (!payment_method_id || !customer_id) {
          throw new Error('Payment method ID and customer ID required');
        }

        // Set as default payment method
        await stripe.customers.update(customer_id, {
          invoice_settings: {
            default_payment_method: payment_method_id,
          }
        });

        // Update database - set all to non-default first
        await supabase
          .from('billing_payment_method')
          .update({ is_default: false })
          .eq('trainer_id', user.id);

        // Set the selected one as default
        await supabase
          .from('billing_payment_method')
          .update({ is_default: true })
          .eq('stripe_payment_method_id', payment_method_id)
          .eq('trainer_id', user.id);

        result = { success: true };
        console.log('Default payment method set:', payment_method_id);
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Payment method management error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to manage payment method' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
