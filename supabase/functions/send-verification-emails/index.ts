import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("FROM_EMAIL") || "Not Another Coach <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailRequest {
  type: 'status_update' | 'expiry_reminder' | 'submission_confirmation';
  trainer_id: string;
  data: any;
}

const emailTemplates = {
  status_update: (data: any) => ({
    subject: `Verification ${data.status === 'verified' ? 'Approved' : 'Update'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Verification Status Update</h1>
        ${data.status === 'verified' 
          ? `<p style="color: #059669; font-weight: bold;">Congratulations! Your trainer profile has been verified.</p>
             <p>Your profile is now live and visible to potential clients.</p>`
          : `<p style="color: #dc2626;">Your verification request needs attention.</p>
             ${data.rejection_reason ? `<p><strong>Reason:</strong> ${data.rejection_reason}</p>` : ''}`
        }
        ${data.admin_notes ? `<p><strong>Notes:</strong> ${data.admin_notes}</p>` : ''}
        <p>
          <a href="${Deno.env.get("SUPABASE_URL")}/trainer/profile-setup?tab=verification" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Verification Status
          </a>
        </p>
      </div>
    `
  }),
  
  expiry_reminder: (data: any) => ({
    subject: `Verification Document Expiring Soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">Document Expiry Reminder</h1>
        <p>Your ${data.check_type.replace('_', ' ')} expires on ${data.expiry_date}.</p>
        <p>Please update your documentation to maintain your verified status.</p>
        <p>
          <a href="${Deno.env.get("SUPABASE_URL")}/trainer/profile-setup?tab=verification" 
             style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Update Documentation
          </a>
        </p>
      </div>
    `
  }),

  submission_confirmation: (data: any) => ({
    subject: 'Verification Documents Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Documents Received</h1>
        <p>Thank you for submitting your verification documents.</p>
        <p>Our team will review your submission within 2-3 business days.</p>
        <p>You'll receive an email once the review is complete.</p>
      </div>
    `
  })
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, trainer_id, data }: EmailRequest = await req.json();

    // Get trainer email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, email")
      .eq("id", trainer_id)
      .single();

    if (profileError || !profile?.email) {
      throw new Error("Trainer email not found");
    }

    const template = emailTemplates[type](data);
    
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [profile.email],
      subject: template.subject,
      html: template.html,
    });

    // Log the email send
    await supabase.from("message_publish_ledger").insert({
      message_type: `verification_${type}`,
      recipient_id: trainer_id,
      delivery_status: "sent",
      delivery_provider: "resend",
      delivery_provider_id: emailResponse.data?.id,
      content_hash: template.subject,
      metadata: { 
        email_type: type,
        trainer_name: profile.first_name 
      }
    });

    return new Response(
      JSON.stringify({ success: true, email_id: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});