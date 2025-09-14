import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ResendConfirmRequest {
  email: string;
  first_name?: string;
  user_type?: string;
  redirect_to?: string;
}

function buildEmailHTML(actionLink: string, firstName?: string) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>👉 Welcome to Not Another Coach — please confirm your email</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">👋 Welcome to Not Another Coach!</h1>
      <p style="color: #f8f9ff; margin: 10px 0 0 0; font-size: 16px;">Not another app. Not another coach. This is personal.</p>
    </div>
    
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      <p style="margin: 0 0 25px 0; font-size: 16px; color: #555;">
        Thanks for joining our community${firstName ? `, ${firstName}` : ''}. To get started, please confirm your email address.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionLink}"
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
          🔑 Confirm My Email
        </a>
      </div>
      
      <p style="margin: 30px 0 20px 0; font-size: 14px; color: #777; text-align: center;">
        Or copy and paste this link in your browser:
      </p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; color: #555; margin: 0 0 30px 0;">
        ${actionLink}
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #555; font-weight: 600;">This helps us keep your account secure.</p>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #777;">Takes less than 30 seconds.</p>
        <p style="margin: 0; font-size: 12px; color: #999;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
      
      <p style="margin: 20px 0 0 0; font-size: 14px; color: #667eea; text-align: center; font-weight: 500;">
        — The Not Another Coach Team
      </p>
    </div>
  </body>
  </html>
  `;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { email, first_name, redirect_to }: ResendConfirmRequest = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const redirect = redirect_to || `${Deno.env.get('SUPABASE_URL') || ''}`;

    // Generate a fresh confirmation link using admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo: redirect },
    } as any);

    if (error) {
      console.error('Error generating confirmation link:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const actionLink = (data as any)?.properties?.action_link || (data as any)?.action_link;

    if (!actionLink) {
      console.error('No action_link returned from generateLink:', data);
      return new Response(JSON.stringify({ error: 'Failed to generate confirmation link' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Build and send the branded email
    const html = buildEmailHTML(actionLink, first_name);

    // Use the verified domain for sending emails
    const fromAddress = 'noreply@notanothercoach.com';

    const sendResult = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: '👉 Welcome to Not Another Coach — please confirm your email',
      html,
    });

    if (sendResult.error) {
      console.error('Error sending confirmation email via Resend:', sendResult.error);
      return new Response(JSON.stringify({ error: sendResult.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true, email_id: sendResult.data?.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error in send-confirmation-email function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});