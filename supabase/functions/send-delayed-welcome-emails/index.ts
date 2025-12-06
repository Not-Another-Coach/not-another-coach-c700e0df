import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailData {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting delayed welcome email job...");

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate the timestamp 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    console.log(`Looking for users created before: ${fiveMinutesAgo}`);

    // Query profiles for users who:
    // 1. Were created 5+ minutes ago
    // 2. Haven't received welcome email yet
    // 3. Have confirmed email (we'll check auth.users)
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, first_name, last_name, user_type, created_at")
      .eq("welcome_email_sent", false)
      .lte("created_at", fiveMinutesAgo)
      .limit(50); // Process in batches

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      console.log("No profiles found needing welcome emails");
      return new Response(
        JSON.stringify({ message: "No profiles to process", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${profiles.length} profiles to check`);

    // Check which users have confirmed emails
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      throw authError;
    }

    // Create a map of confirmed emails
    const confirmedEmails = new Set(
      authUsers.users
        .filter((u) => u.email_confirmed_at !== null)
        .map((u) => u.email)
    );

    console.log(`Found ${confirmedEmails.size} confirmed emails in auth.users`);

    // Filter profiles to only those with confirmed emails
    const confirmedProfiles = profiles.filter((p) => 
      p.email && confirmedEmails.has(p.email)
    );

    console.log(`${confirmedProfiles.length} profiles have confirmed emails`);

    const results = {
      total: confirmedProfiles.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send welcome emails
    for (const profile of confirmedProfiles) {
      try {
        const firstName = profile.first_name || "there";
        const userType = profile.user_type || "user";
        
        console.log(`Sending welcome email to ${profile.email} (${userType})`);

        const emailContent = userType === "trainer" ? {
          subject: "Welcome to Not Another Coach - Let's Get You Set Up! 🚀",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
            </head>
            <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <div style="max-width:600px;margin:0 auto;background:#ffffff;">
                <div style="background:linear-gradient(135deg,#113a5d 0%,#1a5a8a 100%);padding:40px 30px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">Welcome to Not Another Coach!</h1>
                </div>
                
                <div style="padding:40px 30px;">
                  <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#334155;">
                    Hi ${firstName},
                  </p>
                  
                  <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#334155;">
                    We're thrilled to have you join Not Another Coach! Your email has been confirmed and you're all set to start building your coaching profile.
                  </p>
                  
                  <div style="background:#f8fafc;border-left:4px solid #113a5d;padding:20px;margin:20px 0;">
                    <h2 style="margin:0 0 12px;font-size:18px;color:#113a5d;">Next Steps:</h2>
                    <ul style="margin:0;padding-left:20px;color:#334155;line-height:1.8;">
                      <li>Complete your trainer profile setup</li>
                      <li>Add your certifications and specializations</li>
                      <li>Set your availability for discovery calls</li>
                      <li>Start connecting with potential clients!</li>
                    </ul>
                  </div>
                  
                  <p style="margin:20px 0;font-size:16px;line-height:1.6;color:#334155;">
                    Ready to get started? Log in now to complete your profile.
                  </p>
                  
                  <div style="text-align:center;margin:30px 0;">
                    <a href="${Deno.env.get("APP_BASE_URL") || Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || "https://lovable.app"}/auth"
                       style="display:inline-block;background:#113a5d;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">
                      Log In to Your Dashboard
                    </a>
                  </div>
                  
                  <hr style="border:none;border-top:1px solid #e7ecf5;margin:30px 0;">
                  
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#8a95a6;text-align:center;">
                  Need help? <a href="mailto:${Deno.env.get("SUPPORT_EMAIL") || "support@notanother.coach"}" style="color:#113a5d;">Contact support</a> • We're here for you
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        } : {
          subject: "Welcome to Not Another Coach - Find Your Perfect Trainer! 🎯",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
            </head>
            <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <div style="max-width:600px;margin:0 auto;background:#ffffff;">
                <div style="background:linear-gradient(135deg,#113a5d 0%,#1a5a8a 100%);padding:40px 30px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">Welcome to Not Another Coach!</h1>
                </div>
                
                <div style="padding:40px 30px;">
                  <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#334155;">
                    Hi ${firstName},
                  </p>
                  
                  <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#334155;">
                    Welcome to Not Another Coach! Your email is confirmed and you're ready to discover amazing personal trainers who are the perfect fit for your goals.
                  </p>
                  
                  <div style="background:#f8fafc;border-left:4px solid #113a5d;padding:20px;margin:20px 0;">
                    <h2 style="margin:0 0 12px;font-size:18px;color:#113a5d;">What's Next:</h2>
                    <ul style="margin:0;padding-left:20px;color:#334155;line-height:1.8;">
                      <li>Browse verified personal trainers in your area</li>
                      <li>Book free discovery calls to find your match</li>
                      <li>Compare coaching styles and packages</li>
                      <li>Start your fitness journey with confidence!</li>
                    </ul>
                  </div>
                  
                  <p style="margin:20px 0;font-size:16px;line-height:1.6;color:#334155;">
                    Ready to find your perfect trainer? Log in and start exploring.
                  </p>
                  
                  <div style="text-align:center;margin:30px 0;">
                    <a href="${Deno.env.get("APP_BASE_URL") || Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || "https://lovable.app"}/auth" 
                       style="display:inline-block;background:#113a5d;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">
                      Log In & Explore Trainers
                    </a>
                  </div>
                  
                  <hr style="border:none;border-top:1px solid #e7ecf5;margin:30px 0;">
                  
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#8a95a6;text-align:center;">
                    Need help? <a href="mailto:${Deno.env.get("SUPPORT_EMAIL") || "support@notanother.coach"}" style="color:#113a5d;">Contact support</a> • We're here for you
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        };

        const emailResponse = await resend.emails.send({
          from: "Not Another Coach <welcome@notanother.coach>",
          to: [profile.email],
          subject: emailContent.subject,
          html: emailContent.html,
        });

        if (emailResponse.error) {
          throw emailResponse.error;
        }

        // Mark welcome email as sent
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ welcome_email_sent: true })
          .eq("id", profile.id);

        if (updateError) {
          console.error(`Error updating profile ${profile.id}:`, updateError);
          results.errors.push(`Failed to update profile ${profile.email}: ${updateError.message}`);
        } else {
          console.log(`✓ Welcome email sent to ${profile.email}`);
          results.sent++;
        }
      } catch (error: any) {
        console.error(`Error sending email to ${profile.email}:`, error);
        results.failed++;
        results.errors.push(`${profile.email}: ${error.message}`);
      }
    }

    console.log(`Job complete. Sent: ${results.sent}, Failed: ${results.failed}`);

    return new Response(
      JSON.stringify({
        message: "Welcome email job completed",
        ...results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-delayed-welcome-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
