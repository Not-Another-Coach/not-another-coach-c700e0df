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

const createConfirmationEmailHTML = (token: string, token_hash: string, site_url: string, redirect_to: string, email_action_type: string, firstName?: string, logoSettings?: any) => {
  const logoSection = logoSettings?.logo_url 
    ? `<img src="${logoSettings.logo_url}" alt="${logoSettings.app_name || 'Not Another Coach'}" style="height: 50px; margin-bottom: 15px; border-radius: 8px;">`
    : '';
  
  const appName = logoSettings?.app_name || 'Not Another Coach';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>👉 Welcome to ${appName} — please confirm your email</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 10px !important; }
      .header-content { padding: 30px 15px !important; }
      .body-content { padding: 30px 20px !important; }
      .cta-button { padding: 12px 20px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
    
    <!-- Header with brand gradient -->
    <div class="header-content" style="background: linear-gradient(135deg, hsl(220, 91%, 75%) 0%, hsl(262, 52%, 60%) 100%); padding: 40px 30px; text-align: center; position: relative;">
      ${logoSection}
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        👋 Welcome to the ${appName} community!
      </h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 15px 0 0 0; font-size: 18px; font-weight: 400;">
        Where fitness gets personal, not generic.
      </p>
    </div>
    
    <!-- Main content -->
    <div class="body-content" style="padding: 40px 30px;">
      <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #1e293b; font-weight: 600;">
        You're just one click away${firstName ? ` ${firstName}` : ''}!
      </h2>
      
      <p style="margin: 0 0 30px 0; font-size: 16px; color: #475569; line-height: 1.6;">
        Thanks for joining our community of passionate trainers and dedicated clients. To complete your registration and start your personalized fitness journey, please confirm your email address below.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}" 
           class="cta-button"
           style="display: inline-block; 
                  background: linear-gradient(135deg, hsl(220, 91%, 75%) 0%, hsl(262, 52%, 60%) 100%); 
                  color: #ffffff; 
                  padding: 16px 40px; 
                  text-decoration: none; 
                  border-radius: 10px; 
                  font-weight: 600; 
                  font-size: 16px; 
                  box-shadow: 0 6px 20px hsla(220, 91%, 75%, 0.4);
                  transition: all 0.2s ease-in-out;
                  border: none;
                  cursor: pointer;">
          🔑 Confirm My Email
        </a>
      </div>
      
      <!-- Alternative link section -->
      <div style="background: #f1f5f9; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid hsl(220, 91%, 75%);">
        <p style="margin: 0 0 15px 0; font-size: 14px; color: #64748b; font-weight: 500;">
          Having trouble with the button? Copy and paste this link into your browser:
        </p>
        <p style="margin: 0; padding: 12px; background: #ffffff; border-radius: 6px; font-family: 'SFMono-Regular', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 12px; color: #475569; word-break: break-all; border: 1px solid #e2e8f0;">
          <a href="${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}" style="color: #475569; text-decoration: none;">
            ${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}
          </a>
        </p>
      </div>
      
      <!-- Security notice -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%); padding: 20px; border-radius: 10px; margin: 30px 0; text-align: center;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #92400e; font-weight: 600;">
          🛡️ This keeps your account secure
        </h3>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #b45309;">
          Takes less than 30 seconds to complete.
        </p>
        <p style="margin: 0; font-size: 13px; color: #a16207; font-style: italic;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
      
      <!-- Footer -->
      <div style="text-align: center;">
        <p style="margin: 0 0 15px 0; font-size: 16px; color: hsl(220, 91%, 75%); font-weight: 600;">
          — The ${appName} Team
        </p>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">
          Need help? <a href="mailto:support@notanother.coach" style="color: hsl(220, 91%, 75%); text-decoration: none;">Contact our support team</a>
        </p>
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          © 2025 ${appName}. Where fitness gets personal.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
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
    
    console.log('Processing auth email for:', user.email, 'Type:', email_action_type);

    // Handle email confirmation
    if (email_action_type === 'signup') {
      console.log('Sending confirmation email for user:', user.email, 'from:', fromEmail);
      
      // Fetch logo settings
      const logoSettings = await fetchAppLogo();
      const appName = logoSettings?.app_name || 'Not Another Coach';
      
      // Send confirmation email with retry logic
      const subject = `👉 Welcome to ${appName} — please confirm your email`;

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

      console.log('Confirmation email sent successfully:', {
        id: confirmationResult.data?.id,
        to: user.email,
        subject
      });
    } else {
      console.log('Skipping confirmation email - action type:', email_action_type);
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