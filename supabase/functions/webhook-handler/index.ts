import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Webhook signature verification utilities
class WebhookVerifier {
  static async verifyStripeSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const signatureData = encoder.encode(payload);
      const expectedSignature = signature.replace('sha256=', '');
      const signatureBuffer = new Uint8Array(
        expectedSignature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );

      return await crypto.subtle.verify('HMAC', key, signatureBuffer, signatureData);
    } catch (error) {
      console.error('Stripe signature verification failed:', error);
      return false;
    }
  }

  static async verifySendGridSignature(
    payload: string,
    signature: string,
    publicKey: string,
    timestamp: string
  ): Promise<boolean> {
    try {
      // SendGrid uses ECDSA with P-256 curve
      const encoder = new TextEncoder();
      const signedPayload = timestamp + payload;
      
      // Import the public key
      const keyData = atob(publicKey);
      const keyBuffer = new Uint8Array(keyData.length);
      for (let i = 0; i < keyData.length; i++) {
        keyBuffer[i] = keyData.charCodeAt(i);
      }

      const cryptoKey = await crypto.subtle.importKey(
        'spki',
        keyBuffer,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['verify']
      );

      // Decode the signature
      const signatureBuffer = new Uint8Array(
        atob(signature).split('').map(char => char.charCodeAt(0))
      );

      return await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        cryptoKey,
        signatureBuffer,
        encoder.encode(signedPayload)
      );
    } catch (error) {
      console.error('SendGrid signature verification failed:', error);
      return false;
    }
  }

  static async verifyTwilioSignature(
    url: string,
    params: Record<string, string>,
    signature: string,
    authToken: string
  ): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      
      // Create the signature string
      let signatureString = url;
      const sortedKeys = Object.keys(params).sort();
      for (const key of sortedKeys) {
        signatureString += key + params[key];
      }

      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(authToken),
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
      );

      const computedSignature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(signatureString)
      );

      const computedSignatureB64 = btoa(
        String.fromCharCode(...new Uint8Array(computedSignature))
      );

      return computedSignatureB64 === signature;
    } catch (error) {
      console.error('Twilio signature verification failed:', error);
      return false;
    }
  }

  static async verifyGenericHMAC(
    payload: string,
    signature: string,
    secret: string,
    algorithm: 'SHA-256' | 'SHA-1' = 'SHA-256'
  ): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: algorithm },
        false,
        ['verify']
      );

      const signatureData = encoder.encode(payload);
      const expectedSignature = signature.toLowerCase();
      const signatureBuffer = new Uint8Array(
        expectedSignature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );

      return await crypto.subtle.verify('HMAC', key, signatureBuffer, signatureData);
    } catch (error) {
      console.error('Generic HMAC verification failed:', error);
      return false;
    }
  }
}

// Idempotent event processor
class IdempotentEventProcessor {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async processEvent(
    providerEventId: string,
    providerName: string,
    eventType: string,
    webhookSignature: string | null,
    rawPayload: any,
    processor: (payload: any, eventId: string) => Promise<any>
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      console.log(`Processing ${providerName} event: ${eventType} (ID: ${providerEventId})`);

      // Use the idempotent event processing function
      const { data: eventResult, error: eventError } = await this.supabase
        .rpc('process_webhook_event', {
          p_provider_event_id: providerEventId,
          p_provider_name: providerName,
          p_event_type: eventType,
          p_webhook_signature: webhookSignature,
          p_raw_payload: rawPayload
        });

      if (eventError) {
        console.error('Error processing webhook event:', eventError);
        return { success: false, error: eventError.message };
      }

      // Check idempotency status
      if (eventResult.status === 'already_processed') {
        console.log('Event already processed, returning cached result');
        return { success: true, result: eventResult };
      }

      if (eventResult.status === 'in_progress') {
        console.log('Event is currently being processed');
        return { success: true, result: eventResult };
      }

      // Process the event
      try {
        const processingResult = await processor(eventResult.payload, eventResult.event_id);

        // Mark as completed
        await this.supabase.rpc('complete_webhook_event', {
          p_event_id: eventResult.event_id,
          p_result: processingResult || {}
        });

        console.log('Event processed successfully');
        return { success: true, result: processingResult };

      } catch (processingError) {
        console.error('Error during event processing:', processingError);

        // Mark as failed
        await this.supabase.rpc('fail_webhook_event', {
          p_event_id: eventResult.event_id,
          p_error_message: processingError.message
        });

        return { success: false, error: processingError.message };
      }

    } catch (error) {
      console.error('Unexpected error in event processing:', error);
      return { success: false, error: error.message };
    }
  }

  async startWorkflow(
    workflowType: string,
    totalSteps: number = 1,
    initialState: any = {},
    correlationId?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('start_workflow', {
        p_workflow_type: workflowType,
        p_total_steps: totalSteps,
        p_initial_state: initialState,
        p_correlation_id: correlationId
      });

      if (error) {
        console.error('Error starting workflow:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error starting workflow:', error);
      return null;
    }
  }

  async updateWorkflowProgress(
    correlationId: string,
    currentStep: string,
    stateData?: any
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('update_workflow_progress', {
        p_correlation_id: correlationId,
        p_current_step: currentStep,
        p_state_data: stateData
      });

      if (error) {
        console.error('Error updating workflow progress:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error updating workflow progress:', error);
      return false;
    }
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const processor = new IdempotentEventProcessor(supabaseUrl, supabaseServiceKey);
    
    // Get request details
    const url = new URL(req.url);
    const providerName = url.searchParams.get('provider') || 'unknown';
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { raw: rawBody };
    }

    // Extract event details based on provider
    let providerEventId: string;
    let eventType: string;
    let webhookSignature: string | null = null;

    switch (providerName.toLowerCase()) {
      case 'stripe':
        providerEventId = payload.id;
        eventType = payload.type;
        webhookSignature = headers['stripe-signature'];
        
        // Verify Stripe signature if secret is available
        const stripeSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        if (stripeSecret && webhookSignature) {
          const isValid = await WebhookVerifier.verifyStripeSignature(
            rawBody,
            webhookSignature,
            stripeSecret
          );
          if (!isValid) {
            return new Response('Invalid signature', { 
              status: 401, 
              headers: corsHeaders 
            });
          }
        }
        break;

      case 'sendgrid':
        providerEventId = payload.sg_message_id || `${payload.email}-${payload.timestamp}`;
        eventType = payload.event;
        webhookSignature = headers['x-twilio-email-event-webhook-signature'];
        
        // Verify SendGrid signature if public key is available
        const sendGridPublicKey = Deno.env.get('SENDGRID_PUBLIC_KEY');
        const timestamp = headers['x-twilio-email-event-webhook-timestamp'];
        if (sendGridPublicKey && webhookSignature && timestamp) {
          const isValid = await WebhookVerifier.verifySendGridSignature(
            rawBody,
            webhookSignature,
            sendGridPublicKey,
            timestamp
          );
          if (!isValid) {
            return new Response('Invalid signature', { 
              status: 401, 
              headers: corsHeaders 
            });
          }
        }
        break;

      case 'twilio':
        providerEventId = payload.MessageSid || payload.CallSid || payload.SmsSid;
        eventType = payload.MessageStatus || payload.CallStatus || payload.SmsStatus;
        webhookSignature = headers['x-twilio-signature'];
        
        // Verify Twilio signature if auth token is available
        const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        if (twilioAuthToken && webhookSignature) {
          const isValid = await WebhookVerifier.verifyTwilioSignature(
            req.url,
            payload,
            webhookSignature,
            twilioAuthToken
          );
          if (!isValid) {
            return new Response('Invalid signature', { 
              status: 401, 
              headers: corsHeaders 
            });
          }
        }
        break;

      default:
        // Generic webhook handling
        providerEventId = payload.id || payload.event_id || `${providerName}-${Date.now()}`;
        eventType = payload.type || payload.event_type || 'generic';
        webhookSignature = headers['x-webhook-signature'] || headers['x-signature'];
        
        // Verify generic HMAC signature if secret is available
        const genericSecret = Deno.env.get(`${providerName.toUpperCase()}_WEBHOOK_SECRET`);
        if (genericSecret && webhookSignature) {
          const isValid = await WebhookVerifier.verifyGenericHMAC(
            rawBody,
            webhookSignature,
            genericSecret
          );
          if (!isValid) {
            return new Response('Invalid signature', { 
              status: 401, 
              headers: corsHeaders 
            });
          }
        }
        break;
    }

    // Process the event idempotently
    const result = await processor.processEvent(
      providerEventId,
      providerName,
      eventType,
      webhookSignature,
      payload,
      async (eventPayload: any, eventId: string) => {
        console.log(`Processing event ${eventId}:`, eventPayload);
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Stripe-specific event processing
        if (providerName.toLowerCase() === 'stripe') {
          switch (eventType) {
            case 'checkout.session.completed': {
              const session = eventPayload.data.object;
              const metadata = session.metadata;
              
              if (metadata.payment_type === 'coach_selection') {
                // Create customer payment record
                const { error: paymentError } = await supabase
                  .from('customer_payments')
                  .insert({
                    package_id: metadata.package_id,
                    amount_value: session.amount_total / 100,
                    amount_currency: session.currency.toUpperCase(),
                    payment_method: 'card',
                    status: 'succeeded',
                    paid_at: new Date().toISOString(),
                    stripe_payment_intent_id: session.payment_intent,
                    metadata: {
                      stripe_session_id: session.id,
                      payment_mode: metadata.payment_mode,
                      stripe_subscription_id: session.subscription,
                    }
                  });

                if (paymentError) console.error('Payment insert error:', paymentError);

                // Update coach selection request status
                const { error: requestError } = await supabase
                  .from('coach_selection_requests')
                  .update({ 
                    status: 'payment_completed',
                    responded_at: new Date().toISOString() 
                  })
                  .eq('package_id', metadata.package_id)
                  .eq('client_id', metadata.user_id);

                if (requestError) console.error('Request update error:', requestError);

                // Update engagement stage to active_client
                const { error: engagementError } = await supabase
                  .from('client_trainer_engagement')
                  .update({ 
                    stage: 'active_client',
                    became_client_at: new Date().toISOString()
                  })
                  .eq('client_id', metadata.user_id)
                  .eq('trainer_id', metadata.trainer_id);

                if (engagementError) console.error('Engagement update error:', engagementError);

                console.log('Coach selection payment processed:', metadata.package_id);
              } else if (metadata.payment_type === 'trainer_membership') {
                // Will be handled by subscription.created event
                console.log('Membership checkout completed, awaiting subscription creation');
              }
              break;
            }

            case 'customer.subscription.created': {
              const subscription = eventPayload.data.object;
              const metadata = subscription.metadata;

              if (metadata.plan_type) {
                // Create trainer membership record
                const { error: membershipError } = await supabase
                  .from('trainer_membership')
                  .upsert({
                    trainer_id: metadata.user_id,
                    plan_type: metadata.plan_type,
                    status: 'active',
                    stripe_subscription_id: subscription.id,
                    stripe_customer_id: subscription.customer,
                    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    is_active: true,
                  }, {
                    onConflict: 'trainer_id'
                  });

                if (membershipError) console.error('Membership insert error:', membershipError);
                console.log('Trainer membership created:', metadata.user_id);
              }
              break;
            }

            case 'customer.subscription.updated': {
              const subscription = eventPayload.data.object;

              // Update membership status
              const { error: updateError } = await supabase
                .from('trainer_membership')
                .update({
                  status: subscription.status,
                  current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  is_active: subscription.status === 'active',
                })
                .eq('stripe_subscription_id', subscription.id);

              if (updateError) console.error('Membership update error:', updateError);
              console.log('Trainer membership updated:', subscription.id);
              break;
            }

            case 'customer.subscription.deleted': {
              const subscription = eventPayload.data.object;

              // Mark membership as cancelled
              const { error: deleteError } = await supabase
                .from('trainer_membership')
                .update({
                  status: 'cancelled',
                  is_active: false,
                  cancelled_at: new Date().toISOString(),
                })
                .eq('stripe_subscription_id', subscription.id);

              if (deleteError) console.error('Membership cancellation error:', deleteError);
              console.log('Trainer membership cancelled:', subscription.id);
              break;
            }

            case 'invoice.payment_succeeded': {
              const invoice = eventPayload.data.object;

              // Create/update billing invoice
              const { error: invoiceError } = await supabase
                .from('billing_invoice')
                .upsert({
                  stripe_invoice_id: invoice.id,
                  trainer_id: invoice.metadata?.trainer_id,
                  amount_cents: invoice.amount_paid,
                  currency: invoice.currency.toUpperCase(),
                  status: 'paid',
                  invoice_type: invoice.subscription ? 'subscription' : 'one_off',
                  period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString().split('T')[0] : null,
                  period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString().split('T')[0] : null,
                  download_url: invoice.invoice_pdf,
                  paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
                }, {
                  onConflict: 'stripe_invoice_id'
                });

              if (invoiceError) console.error('Invoice insert error:', invoiceError);
              console.log('Invoice payment succeeded:', invoice.id);
              break;
            }

            case 'invoice.payment_failed': {
              const invoice = eventPayload.data.object;

              // Update invoice status
              const { error: invoiceError } = await supabase
                .from('billing_invoice')
                .update({
                  status: 'failed',
                })
                .eq('stripe_invoice_id', invoice.id);

              if (invoiceError) console.error('Invoice update error:', invoiceError);

              // Create alert for trainer
              const { error: alertError } = await supabase
                .from('alerts')
                .insert({
                  alert_type: 'payment_failed',
                  title: 'Payment Failed',
                  content: `Your payment of ${invoice.currency.toUpperCase()} ${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method.`,
                  target_audience: { trainers: [invoice.metadata?.trainer_id] },
                  metadata: {
                    invoice_id: invoice.id,
                    amount: invoice.amount_due,
                    currency: invoice.currency,
                  },
                  is_active: true,
                  priority: 3,
                });

              if (alertError) console.error('Alert creation error:', alertError);
              console.log('Invoice payment failed, alert created:', invoice.id);
              break;
            }

            default:
              console.log('Unhandled Stripe event type:', eventType);
          }
        }
        
        return {
          processed_at: new Date().toISOString(),
          event_id: eventId,
          provider_event_id: providerEventId,
          event_type: eventType
        };
      }
    );

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify(result.result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);