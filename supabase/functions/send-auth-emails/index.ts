import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";


const resendApiKey = Deno.env.get("RESEND_API_KEY") as string;
const resend = new Resend(resendApiKey);
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;
const DEFAULT_FROM = 'Not Another Coach <onboarding@resend.dev>';
const RAW_FROM = Deno.env.get("FROM_EMAIL")?.trim();
const TEST_FROM = Deno.env.get("TEST_FROM_EMAIL")?.trim();

// Initialize Supabase client for logo fetching
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Log API key status (masked for security)
const maskedApiKey = resendApiKey ? `${resendApiKey.substring(0, 6)}...` : 'NOT_SET';
console.log('RESEND_API_KEY status:', maskedApiKey);

const stripWrappingQuotes = (val?: string) => (val ? val.replace(/^['"]|['"]$/g, '') : '');
const isValidFrom = (val: string) => {
  const v = stripWrappingQuotes(val).trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const namedPattern = /^[^<>]+<\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*>$/;
  return emailPattern.test(v) || namedPattern.test(v);
};

const fromEmail = (() => {
  // Check for test override first
  if (TEST_FROM) {
    const candidate = stripWrappingQuotes(TEST_FROM);
    if (isValidFrom(candidate)) {
      console.log("Using TEST_FROM_EMAIL override:", candidate);
      return candidate;
    } else {
      console.warn("TEST_FROM_EMAIL invalid format, ignoring:", TEST_FROM);
    }
  }
  
  // Use regular FROM_EMAIL
  const candidate = stripWrappingQuotes(RAW_FROM);
  if (candidate && isValidFrom(candidate)) {
    console.log("Using FROM_EMAIL:", candidate);
    return candidate;
  }
  console.warn("FROM_EMAIL secret missing or invalid; falling back to default sender. Received value:", RAW_FROM);
  return DEFAULT_FROM;
})();

// Retry utility for Resend API calls
const retryResendCall = async (fn: () => Promise<any>, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      console.warn(`Attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

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

// Fetch app logo from settings
const fetchAppLogo = async () => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'app_logo')
      .single();
    
    if (error || !data?.setting_value) {
      return null;
    }
    
    const logoSettings = typeof data.setting_value === 'string' 
      ? JSON.parse(data.setting_value) 
      : data.setting_value;
    
    return logoSettings;
  } catch (error) {
    console.warn('Failed to fetch app logo:', error);
    return null;
  };
}

// Create confirmation email HTML with enhanced branding
const createConfirmationEmailHTML = (
  token: string, 
  token_hash: string, 
  site_url: string, 
  redirect_to: string, 
  email_action_type: string, 
  firstName?: string, 
  logoSettings?: any
) => {
  const displayName = firstName || 'there';
  const appName = logoSettings?.app_name || 'Not Another Coach';
  const confirmationUrl = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Confirm Your Email - ${appName}</title>
    <style>
        @media (prefers-color-scheme: dark) {
            .bg { background: #0c1523 !important; }
            .card { background: #101a2b !important; border-color: #2a3754 !important; }
            .text, .muted, .h1 { color: #f3f6fb !important; }
            .btn { background: #2a74c0 !important; }
            .rule { border-color: #2a3754 !important; }
        }
        a { text-decoration: none; }
    </style>
</head>
<body style="margin:0;padding:0;background:#f6f8fb;">
<center style="width:100%;background:#f6f8fb;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
        You're almost in! Confirm your email to start your fitness journey.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg" style="background:#f6f8fb;">
        <tr><td align="center" style="padding:32px 16px;">
            <table role="presentation" width="600" style="max-width:600px;width:100%;">
                <!-- Logo -->
                <tr>
                    <td align="center" style="padding:0 8px 24px;">
                        ${logoSettings?.logo_url ? 
                            `<img src="${logoSettings.logo_url}" width="180" height="auto" alt="${appName}" style="display:block;border:0;max-width:180px;">` : 
                            `<div style="font:700 32px/1 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#113a5d;">${appName}</div>`
                        }
                    </td>
                </tr>
                <!-- Card -->
                <tr>
                    <td class="card" style="background:#ffffff;border:1px solid #e7ecf5;border-radius:14px;padding:32px;">
                        <h1 class="h1" style="margin:0 0 8px;font:700 28px/1.25 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;text-align:center;">
                            You're almost in! 🎉
                        </h1>
                        <p class="text" style="margin:0 0 24px;font:16px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c2b3a;text-align:center;">
                            Hi ${displayName}, welcome to <strong>${appName}</strong>. One quick click confirms your email and unlocks your fitness journey.
                        </p>
                        
                        <!-- CTA Button -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                            <tr><td align="center">
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                    <tr><td class="btn" style="background:#113a5d;border-radius:10px;">
                                        <a href="${confirmationUrl}" target="_blank"
                                           style="display:inline-block;padding:16px 32px;font:600 16px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#ffffff;background:#113a5d;border-radius:10px;text-decoration:none;">
                                           🔑 Confirm My Email
                                        </a>
                                    </td></tr>
                                </table>
                            </td></tr>
                        </table>
                        
                        <!-- Security Note -->
                        <div style="background:#f0f9ff;border:1px solid #dde7fb;border-radius:8px;padding:16px;margin:0 0 20px;">
                            <p class="muted" style="margin:0;font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">
                                <strong>🛡️ Quick & Secure:</strong> Takes 30 seconds and keeps your account safe. If you didn't create this account, you can safely ignore this email.
                            </p>
                        </div>
                        
                        <!-- Backup Link -->
                        <p class="muted" style="margin:0 0 8px;font:13px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#6b778c;">
                            <strong>Button not working?</strong> Copy and paste this link into your browser:
                        </p>
                        
                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;margin:0 0 20px;">
                            <a href="${confirmationUrl}" style="color:#113a5d;word-break:break-all;font:13px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;text-decoration:none;">
                                ${confirmationUrl}
                            </a>
                        </div>
                        
                        <hr class="rule" style="border:none;border-top:1px solid #e7ecf5;margin:20px 0 16px">
                        <p class="muted" style="margin:0;font:12px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#8a95a6;text-align:center;">
                            Need help? <a href="mailto:support@notanother.coach" style="color:#113a5d;">Contact support</a> • We're here for you
                        </p>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr><td align="center" style="padding:20px 8px;">
                    <p class="muted" style="margin:0;font:12px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#8a95a6;">
                        © ${new Date().getFullYear()} ${appName} • Where fitness gets personal
                    </p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</center>
</body>
</html>`;
};

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

    // Verify webhook signature using Standard Webhooks (Supabase Auth Hooks default)
    let webhookData: { user: AuthUser; email_data: AuthEmailData };
    if (hookSecret) {
      const secret = hookSecret.replace("v1,whsec_", "");
      const wh = new Webhook(secret);
      try {
        webhookData = wh.verify(payload, headers) as {
          user: AuthUser;
          email_data: AuthEmailData;
        };
        console.log('Webhook signature verified');
      } catch (error: any) {
        console.warn('Webhook verification failed', error?.message || error);
        return new Response(
          JSON.stringify({ error: 'Unauthorized: invalid signature' }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      console.warn('SEND_EMAIL_HOOK_SECRET not set; parsing payload without verification');
      webhookData = JSON.parse(payload) as {
        user: AuthUser;
        email_data: AuthEmailData;
      };
    }

    const { user, email_data } = webhookData;
    const { token, token_hash, redirect_to, email_action_type } = email_data;
    
    const firstName = user.user_metadata?.first_name;
    const userType = user.user_metadata?.user_type;
    
    console.log('Processing auth email for:', user.email, 'Type:', email_action_type, 'User ID:', user.id);

    // Handle email confirmation (both new signups and repeated signup attempts)
    if (email_action_type === 'signup' || email_action_type === 'user_repeated_signup') {
      // Log action type for debugging
      if (email_action_type === 'user_repeated_signup') {
        console.log('🔄 Handling repeated signup attempt - resending confirmation for:', user.email);
      } else {
        console.log('📧 Sending initial confirmation email for user:', user.email);
      }
      console.log('Using from address:', fromEmail);
      
      // Fetch logo settings
      const logoSettings = await fetchAppLogo();
      const appName = logoSettings?.app_name || 'Not Another Coach';
      
      // Send confirmation email with retry logic
      const subject = email_action_type === 'user_repeated_signup' 
        ? `🔑 Confirm your ${appName} email` 
        : `👉 Welcome to ${appName} — please confirm your email`;

      const confirmationResult = await retryResendCall(() =>
        resend.emails.send({
          from: fromEmail,
          to: [user.email],
          subject,
          html: createConfirmationEmailHTML(
            token,
            token_hash,
            Deno.env.get('SUPABASE_URL') || '',
            redirect_to,
            email_action_type,
            firstName,
            logoSettings
          ),
        })
      );

      if (confirmationResult.error) {
        const e = confirmationResult.error;
        
        // Enhanced error logging - capture full error details
        console.error('Resend API error details:', {
          message: e?.message,
          name: e?.name,
          code: e?.code,
          status: e?.status,
          response: e?.response,
          fullError: JSON.stringify(e, Object.getOwnPropertyNames(e))
        });
        
        // Create comprehensive error message
        const errorParts = [
          e?.message,
          e?.name,
          e?.code && `Code: ${e.code}`,
          e?.status && `Status: ${e.status}`,
          typeof e === 'string' ? e : null
        ].filter(Boolean);
        
        const message = errorParts.length > 0 ? errorParts.join(' | ') : JSON.stringify(e);
        throw new Error(`Failed to send confirmation email: ${message}`);
      }

      console.log('✅ Confirmation email sent successfully:', {
        id: confirmationResult.data?.id,
        to: user.email,
        subject,
        actionType: email_action_type,
        isRepeatedSignup: email_action_type === 'user_repeated_signup'
      });
    } else {
      console.log('⏭️ Skipping confirmation email - action type:', email_action_type);
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