import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("FROM_EMAIL") || 'Not Another Coach <onboarding@resend.dev>';

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

const createWelcomeEmailHTML = (firstName?: string, userType?: string) => {
  const displayName = firstName || 'there';
  const appUrl = Deno.env.get('SUPABASE_URL')?.replace('/v1', '') || 'https://notanothercoach.com';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Welcome to Not Another Coach!</title>
    <style>
        @media (prefers-color-scheme: dark) {
            .bg { background: #0c1523 !important; }
            .card { background: #101a2b !important; border-color: #2a3754 !important; }
            .text, .muted, .h1 { color: #f3f6fb !important; }
            .chip { background: #1b2a44 !important; border-color: #2a3754 !important; color: #e8eef9 !important; }
            .btn { background: #2a74c0 !important; }
            .rule { border-color: #2a3754 !important; }
        }
        a { text-decoration: none; }
    </style>
</head>
<body style="margin:0;padding:0;background:#f6f8fb;">
<center style="width:100%;background:#f6f8fb;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
        Your journey awaits: survey, browse, shortlist, chat, choose, begin! 🚀
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg">
        <tr><td align="center" style="padding:32px 16px;">
            <table role="presentation" width="640" style="max-width:640px;width:100%;">
                <!-- Logo -->
                <tr>
                    <td align="center" style="padding:0 8px 20px;">
                        <div style="font:700 32px/1 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#113a5d;">
                            Not Another Coach
                        </div>
                    </td>
                </tr>

                <!-- Card -->
                <tr>
                    <td class="card" style="background:#ffffff;border:1px solid #e7ecf5;border-radius:14px;padding:32px;">
                        <h1 class="h1" style="margin:0 0 8px;font:700 28px/1.25 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;text-align:center;">
                            Welcome, ${displayName}! 🎉
                        </h1>
                        <p class="text" style="margin:0 0 20px;font:16px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c2b3a;text-align:center;">
                            ${userType === 'trainer' ? 
                                'You\'re in! Ready to transform lives and build your coaching business?' : 
                                'You\'re in! Here\'s your quick path to finding the perfect coach and getting results.'
                            }
                        </p>

                        <!-- Primary CTA -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                            <tr><td align="center">
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                    <tr><td class="btn" style="background:#113a5d;border-radius:10px;">
                                         <a href="${userType === 'trainer' ? appUrl : `${appUrl}/client-survey`}" target="_blank"
                                           style="display:inline-block;padding:16px 32px;font:600 16px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#ffffff;background:#113a5d;border-radius:10px;">
                                            ${userType === 'trainer' ? '🚀 Complete My Profile' : '📝 Complete the Quick Survey to Find Your Matches'}
                                        </a>
                                    </td></tr>
                                </table>
                            </td></tr>
                        </table>

                        ${userType === 'trainer' ? `
                        <!-- Trainer Journey -->
                        <h3 style="margin:0 0 16px;font:600 18px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Your Coach Journey:</h3>
                        
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
                            <tr><td style="padding:0 0 8px;">
                                <div class="chip" style="background:#f0f5ff;border:1px solid #dde7fb;border-radius:10px;padding:14px;">
                                    <div style="display:flex;align-items:center;">
                                        <span style="font-size:20px;margin-right:12px;">✨</span>
                                        <div>
                                            <div style="font:600 15px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Complete Your Profile</div>
                                            <div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">Add qualifications, experience, and specializations</div>
                                        </div>
                                    </div>
                                </div>
                            </td></tr>
                            
                            <tr><td style="padding:8px 0;">
                                <div class="chip" style="background:#f0fff6;border:1px solid #d9f2e5;border-radius:10px;padding:14px;">
                                    <div style="display:flex;align-items:center;">
                                        <span style="font-size:20px;margin-right:12px;">📋</span>
                                        <div>
                                            <div style="font:600 15px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Verify Credentials</div>
                                            <div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">Upload certifications and get verified</div>
                                        </div>
                                    </div>
                                </div>
                            </td></tr>
                            
                            <tr><td style="padding:8px 0;">
                                <div class="chip" style="background:#fff8ef;border:1px solid #ffe0bf;border-radius:10px;padding:14px;">
                                    <div style="display:flex;align-items:center;">
                                        <span style="font-size:20px;margin-right:12px;">💰</span>
                                        <div>
                                            <div style="font:600 15px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Set Your Rates</div>
                                            <div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">Configure packages and availability</div>
                                        </div>
                                    </div>
                                </div>
                            </td></tr>
                            
                            <tr><td style="padding:8px 0 0;">
                                <div class="chip" style="background:#eef6ff;border:1px solid #d8e8ff;border-radius:10px;padding:14px;">
                                    <div style="display:flex;align-items:center;">
                                        <span style="font-size:20px;margin-right:12px;">🎯</span>
                                        <div>
                                            <div style="font:600 15px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Connect with Clients</div>
                                            <div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">Start receiving inquiries and discovery calls</div>
                                        </div>
                                    </div>
                                </div>
                            </td></tr>
                        </table>
                        ` : `
                        <!-- Client Journey Timeline -->
                        <h3 style="margin:0 0 16px;font:600 18px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Your Fitness Journey:</h3>
                        
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
                            <tr><td style="padding:0 0 8px;">
                                <div class="chip" style="background:#f0f5ff;border:1px solid #dde7fb;border-radius:10px;padding:14px;">
                                    <div style="display:flex;align-items:center;">
                                        <span style="font-size:20px;margin-right:12px;">📝</span>
                                        <div>
                                            <div style="font:600 15px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Quick Survey</div>
                                            <div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">Tell us your goals, budget, and availability</div>
                                        </div>
                                    </div>
                                </div>
                            </td></tr>
                            
                            <tr><td style="padding:8px 0;">
                                <div class="chip" style="background:#f0fff6;border:1px solid #d9f2e5;border-radius:10px;padding:14px;">
                                    <div style="display:flex;align-items:center;">
                                        <span style="font-size:20px;margin-right:12px;">🔎</span>
                                        <div>
                                            <div style="font:600 15px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Browse Trainers</div>
                                            <div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">Explore verified profiles that match your needs</div>
                                        </div>
                                    </div>
                                </div>
                            </td></tr>
                            
                            <tr><td style="padding:8px 0;">
                                <div class="chip" style="background:#fff8ef;border:1px solid #ffe0bf;border-radius:10px;padding:14px;">
                                    <div style="display:flex;align-items:center;">
                                        <span style="font-size:20px;margin-right:12px;">⭐</span>
                                        <div>
                                            <div style="font:600 15px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Shortlist Favorites</div>
                                            <div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">Save top picks to compare side-by-side</div>
                                        </div>
                                    </div>
                                </div>
                            </td></tr>
                            
                            <tr><td style="padding:8px 0;">
                                <div class="chip" style="background:#eef6ff;border:1px solid #d8e8ff;border-radius:10px;padding:14px;">
                                    <div style="display:flex;align-items:center;">
                                        <span style="font-size:20px;margin-right:12px;">💬</span>
                                        <div>
                                            <div style="font:600 15px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Chat & Engage</div>
                                            <div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">Message coaches or book discovery calls</div>
                                        </div>
                                    </div>
                                </div>
                            </td></tr>
                            
                            <tr><td style="padding:8px 0;">
                                <div class="chip" style="background:#f5f0ff;border:1px solid #e4d9ff;border-radius:10px;padding:14px;">
                                    <div style="display:flex;align-items:center;">
                                        <span style="font-size:20px;margin-right:12px;">✅</span>
                                        <div>
                                            <div style="font:600 15px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Choose Your Coach</div>
                                            <div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">Pick based on expertise, style & availability</div>
                                        </div>
                                    </div>
                                </div>
                            </td></tr>
                            
                            <tr><td style="padding:8px 0 0;">
                                <div class="chip" style="background:#effafc;border:1px solid #cfeaf2;border-radius:10px;padding:14px;">
                                    <div style="display:flex;align-items:center;">
                                        <span style="font-size:20px;margin-right:12px;">🚀</span>
                                        <div>
                                            <div style="font:600 15px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1b2a;">Start Your Journey</div>
                                            <div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#425066;">Set goals together and begin your program</div>
                                        </div>
                                    </div>
                                </div>
                            </td></tr>
                        </table>
                        `}

                        <!-- Secondary CTA -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                            <tr><td align="center">
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                    <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                                        <a href="${appUrl}" target="_blank"
                                           style="display:inline-block;padding:12px 24px;font:600 14px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#113a5d;text-decoration:none;">
                                           ${userType === 'trainer' ? 'Browse the Platform' : 'Explore Verified Trainers'}
                                        </a>
                                    </td></tr>
                                </table>
                            </td></tr>
                        </table>

                        <hr class="rule" style="border:none;border-top:1px solid #e7ecf5;margin:20px 0 16px">
                        <p class="muted" style="margin:0;font:12px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#8a95a6;text-align:center;">
                            Need help getting started? <a href="mailto:support@notanother.coach" style="color:#113a5d;">Contact our support team</a>
                        </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr><td align="center" style="padding:20px 8px;">
                    <p class="muted" style="margin:0;font:12px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#8a95a6;">
                        © ${new Date().getFullYear()} Not Another Coach • Where fitness gets personal
                    </p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</center>
</body>
</html>`;
};

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
    const { user, userType } = await req.json();
    
    if (!user?.email) {
      throw new Error("User email is required");
    }

    const firstName = user.user_metadata?.first_name || user.raw_user_meta_data?.first_name;
    
    console.log('Sending welcome email to:', user.email, 'Type:', userType);

    const welcomeResult = await retryResendCall(() => 
      resend.emails.send({
        from: fromEmail,
        to: [user.email],
        subject: `Welcome to Not Another Coach${firstName ? `, ${firstName}` : ''}! 🎉`,
        html: createWelcomeEmailHTML(firstName, userType),
      })
    );

    if (welcomeResult.error) {
      console.error('Error sending welcome email:', welcomeResult.error);
      throw new Error(`Failed to send welcome email: ${welcomeResult.error.message}`);
    }

    console.log('Welcome email sent successfully:', {
      id: welcomeResult.data?.id,
      to: user.email,
      subject: `Welcome to Not Another Coach${firstName ? `, ${firstName}` : ''}! 🎉`
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully',
        emailId: welcomeResult.data?.id 
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
    console.error("Error in send-welcome-email function:", error);
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