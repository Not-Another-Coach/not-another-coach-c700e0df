import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_AUTH_EMAILS_HOOK_SECRET") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

interface AuthUser {
  email: string;
  id: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    user_type?: string;
  };
}

const createConfirmationEmailHTML = (token: string, token_hash: string, site_url: string, redirect_to: string, email_action_type: string, firstName?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email - Not Another Coach</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Not Another Coach</h1>
    <p style="color: #f8f9ff; margin: 10px 0 0 0; font-size: 16px;">Not another app. Not another coach. This is personal.</p>
  </div>
  
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome${firstName ? ` ${firstName}` : ''}!</h2>
    
    <p style="margin: 0 0 25px 0; font-size: 16px; color: #555;">
      Thank you for joining Not Another Coach. We're excited to help you on your fitness journey with a truly personal approach.
    </p>
    
    <p style="margin: 0 0 30px 0; font-size: 16px; color: #555;">
      Please confirm your email address by clicking the button below:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
        Confirm Email Address
      </a>
    </div>
    
    <p style="margin: 30px 0 20px 0; font-size: 14px; color: #777; text-align: center;">
      Or copy and paste this link in your browser:
    </p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; color: #555; margin: 0 0 30px 0;">
      ${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}
    </div>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #777;">
      This link will expire in 24 hours for security reasons.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
      If you didn't create an account with Not Another Coach, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
`;

const createWelcomeEmailHTML = (firstName?: string, userType?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Not Another Coach</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Not Another Coach</h1>
    <p style="color: #f8f9ff; margin: 10px 0 0 0; font-size: 16px;">Your personal fitness journey starts here</p>
  </div>
  
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome to the family${firstName ? ` ${firstName}` : ''}! 🎉</h2>
    
    <p style="margin: 0 0 25px 0; font-size: 16px; color: #555;">
      Your email has been confirmed and your account is now active. You're now part of a community that believes fitness should be personal, not generic.
    </p>
    
    ${userType === 'trainer' ? `
    <h3 style="color: #667eea; margin: 30px 0 15px 0; font-size: 20px;">Next Steps for Coaches:</h3>
    <ul style="margin: 0 0 25px 20px; color: #555;">
      <li style="margin-bottom: 10px;">Complete your coach profile to attract the right clients</li>
      <li style="margin-bottom: 10px;">Add your specializations and certifications</li>
      <li style="margin-bottom: 10px;">Upload professional photos and client testimonials</li>
      <li style="margin-bottom: 10px;">Set your availability and pricing</li>
    </ul>
    ` : `
    <h3 style="color: #667eea; margin: 30px 0 15px 0; font-size: 20px;">Next Steps:</h3>
    <ul style="margin: 0 0 25px 20px; color: #555;">
      <li style="margin-bottom: 10px;">Complete your client survey to help us match you perfectly</li>
      <li style="margin-bottom: 10px;">Browse our verified coaches and their specializations</li>
      <li style="margin-bottom: 10px;">Book discovery calls with coaches that interest you</li>
      <li style="margin-bottom: 10px;">Start your personalized fitness journey</li>
    </ul>
    `}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://lovable.app'}" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
        Get Started Now
      </a>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">💡 Remember</h4>
      <p style="margin: 0; font-size: 14px; color: #555;">
        This isn't just another fitness app. We're building genuine connections between real people who are passionate about health and fitness. Your journey is unique, and so should be your coaching experience.
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="margin: 0 0 15px 0; font-size: 14px; color: #555;">
      Questions? Need help getting started? Just reply to this email - we're here to help!
    </p>
    
    <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
      Welcome to Not Another Coach - where fitness gets personal.
    </p>
  </div>
</body>
</html>
`;

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Skip webhook verification in development if no secret is provided
    let webhookData;
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      webhookData = wh.verify(payload, headers) as {
        user: AuthUser;
        email_data: AuthEmailData;
      };
    } else {
      // Parse directly in development
      webhookData = JSON.parse(payload) as {
        user: AuthUser;
        email_data: AuthEmailData;
      };
    }

    const { user, email_data } = webhookData;
    const { token, token_hash, redirect_to, email_action_type } = email_data;
    
    const firstName = user.user_metadata?.first_name;
    const userType = user.user_metadata?.user_type;
    
    console.log('Processing auth email for:', user.email, 'Type:', email_action_type);

    // Handle email confirmation
    if (email_action_type === 'signup') {
      // Send confirmation email
      const confirmationResult = await resend.emails.send({
        from: 'Not Another Coach <noreply@resend.dev>',
        to: [user.email],
        subject: 'Confirm your email - Not Another Coach',
        html: createConfirmationEmailHTML(
          token, 
          token_hash, 
          Deno.env.get('SUPABASE_URL') || '', 
          redirect_to, 
          email_action_type,
          firstName
        ),
      });

      if (confirmationResult.error) {
        console.error('Error sending confirmation email:', confirmationResult.error);
        throw confirmationResult.error;
      }

      console.log('Confirmation email sent successfully:', confirmationResult.data?.id);

      // Schedule welcome email for after confirmation (using setTimeout in production you'd use a proper queue)
      setTimeout(async () => {
        try {
          const welcomeResult = await resend.emails.send({
            from: 'Not Another Coach <noreply@resend.dev>',
            to: [user.email],
            subject: `Welcome to Not Another Coach${firstName ? `, ${firstName}` : ''}! 🎉`,
            html: createWelcomeEmailHTML(firstName, userType),
          });

          if (welcomeResult.error) {
            console.error('Error sending welcome email:', welcomeResult.error);
          } else {
            console.log('Welcome email sent successfully:', welcomeResult.data?.id);
          }
        } catch (error) {
          console.error('Error sending welcome email:', error);
        }
      }, 2000); // Delay welcome email by 2 seconds
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Auth email processed successfully' 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-auth-emails function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
});