import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const createWelcomeEmailHTML = (firstName?: string, userType?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Not Another Coach!</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .title { font-size: 24px; color: #1f2937; margin-bottom: 10px; }
        .subtitle { color: #6b7280; font-size: 16px; }
        .content { margin: 30px 0; }
        .highlight { background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0; }
        .cta { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Not Another Coach</div>
            <div class="title">Welcome${firstName ? `, ${firstName}` : ''}! 🎉</div>
            <div class="subtitle">Your fitness journey starts here</div>
        </div>

        <div class="content">
            <p>Thank you for confirming your email and joining Not Another Coach! We're excited to have you on board.</p>
            
            ${userType === 'trainer' ? `
            <div class="highlight">
                <h3>🏋️ Ready to Transform Lives?</h3>
                <p>As a coach on our platform, you'll be able to:</p>
                <ul>
                    <li>Connect with motivated clients looking for expert guidance</li>
                    <li>Build your coaching business with our powerful tools</li>
                    <li>Create personalized training programs and track progress</li>
                    <li>Establish meaningful relationships with your clients</li>
                </ul>
            </div>
            
            <p><strong>Next steps:</strong></p>
            <ol>
                <li>Complete your coach profile setup</li>
                <li>Add your qualifications and experience</li>
                <li>Set your availability and rates</li>
                <li>Start connecting with potential clients!</li>
            </ol>
            ` : `
            <div class="highlight">
                <h3>🎯 Ready to Transform Your Fitness?</h3>
                <p>As a client on our platform, you'll be able to:</p>
                <ul>
                    <li>Find qualified coaches who match your goals</li>
                    <li>Get personalized training programs</li>
                    <li>Track your progress with expert guidance</li>
                    <li>Achieve sustainable results</li>
                </ul>
            </div>
            
            <p><strong>Next steps:</strong></p>
            <ol>
                <li>Complete your fitness assessment</li>
                <li>Browse our verified coaches</li>
                <li>Schedule discovery calls with potential coaches</li>
                <li>Start your transformation journey!</li>
            </ol>
            `}

            <div class="cta">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('/v1', '') || 'https://notanothercoach.com'}" class="button">
                    Get Started Now
                </a>
            </div>

            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
        </div>

        <div class="footer">
            <p>Welcome to the Not Another Coach community!</p>
            <p><strong>The Not Another Coach Team</strong></p>
            <p style="margin-top: 20px; font-size: 12px;">
                If you didn't create this account, please ignore this email.
            </p>
        </div>
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
    const { user, userType } = await req.json();
    
    if (!user?.email) {
      throw new Error("User email is required");
    }

    const firstName = user.user_metadata?.first_name || user.raw_user_meta_data?.first_name;
    
    console.log('Sending welcome email to:', user.email, 'Type:', userType);

    const welcomeResult = await resend.emails.send({
      from: 'Not Another Coach <noreply@resend.dev>',
      to: [user.email],
      subject: `Welcome to Not Another Coach${firstName ? `, ${firstName}` : ''}! 🎉`,
      html: createWelcomeEmailHTML(firstName, userType),
    });

    if (welcomeResult.error) {
      console.error('Error sending welcome email:', welcomeResult.error);
      throw welcomeResult.error;
    }

    console.log('Welcome email sent successfully:', welcomeResult.data?.id);

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